import { calculateHeatRisk, getWaterStagnationSusceptibility } from "./RiskCalculator";

// Singleton to manage heavy CSV data
class EnvironmentalDataManagerService {
    constructor() {
        this.ndviTable = null;
        this.stagnationTable = null;
        this.heatTable = null;
        this.loadingPromise = null;
    }

    // Initialize all data (Singleton pattern)
    async initialize() {
        if (this.loadingPromise) return this.loadingPromise;
        if (this.isLoaded()) return Promise.resolve();

        this.loadingPromise = (async () => {
            try {
                // Parallel Fetch
                const [ndviText, stagnationText, lstText] = await Promise.all([
                    fetch("/Solapur_Wardwise_NDVI_2023.csv").then(res => res.text()),
                    fetch("/Solapur_Ward_Water_Stagnation_Risk.csv").then(res => res.text()),
                    fetch("/Solapur_Ward_Heat_Stress_LST.csv").then(res => res.text())
                ]);

                // 1. Process NDVI
                this._processNDVI(ndviText);

                // 2. Process Stagnation
                this._processStagnation(stagnationText);

                // 3. Process Heat (Depends on NDVI)
                this._processHeat(lstText);

                console.log("Environmental Data Manager: Initialized");
            } catch (err) {
                console.error("Failed to load environmental data:", err);
            }
        })();

        return this.loadingPromise;
    }

    isLoaded() {
        return this.ndviTable && this.stagnationTable && this.heatTable;
    }

    // --- GETTERS ---

    getNDVIRecord(wardName) {
        if (!this.ndviTable) return null;
        return this.ndviTable[wardName.toLowerCase()] || null;
    }

    getStagnationRecord(wardName) {
        if (!this.stagnationTable) return null;
        return this.stagnationTable[wardName.toLowerCase()] || null;
    }

    getHeatRecord(wardName) {
        if (!this.heatTable) return null;
        return this.heatTable[wardName.toLowerCase()] || null;
    }

    getAllHeatData() {
        return this.heatTable;
    }

    getAllNDVIData() {
        return this.ndviTable;
    }

    getAllStagnationData() {
        return this.stagnationTable;
    }

    // --- PROCESSORS ---

    _processNDVI(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(",");
        const nameIdx = headers.indexOf("Name");
        const meanIdx = headers.indexOf("NDVI_mean");

        const map = {};
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            const name = cols[nameIdx]?.trim().toLowerCase();
            const mean = parseFloat(cols[meanIdx]);
            if (name) map[name] = { mean };
        }
        this.ndviTable = map;
    }

    _processStagnation(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(",");
        const nameIdx = headers.indexOf("Name");
        const areaIdx = headers.indexOf("Total_Area");
        const ndviIdx = headers.indexOf("mean");
        const slopeIdx = headers.indexOf("mean_slope_deg");

        const map = {};
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            const name = cols[nameIdx]?.trim().toLowerCase();
            if (name) {
                const totalArea = parseFloat(cols[areaIdx]);
                const ndviMean = parseFloat(cols[ndviIdx]);
                const slope = parseFloat(cols[slopeIdx]);
                const level = getWaterStagnationSusceptibility(ndviMean, totalArea);
                map[name] = { totalArea, ndviMean, slope, level };
            }
        }
        this.stagnationTable = map;
    }

    _processHeat(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(",");
        const nameIdx = headers.indexOf("Name");
        const lstIdx = headers.indexOf("mean_lst_c");

        const wardLSTs = [];
        const tempMap = {};

        // Pass 1: Collect
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            const name = cols[nameIdx]?.trim().toLowerCase();
            const meanLst = parseFloat(cols[lstIdx]);
            if (name && !isNaN(meanLst)) {
                wardLSTs.push(meanLst);
                tempMap[name] = { meanLst };
            }
        }

        // Pass 2: Percentiles
        wardLSTs.sort((a, b) => a - b);
        const p25 = wardLSTs[Math.floor(wardLSTs.length * 0.25)];
        const p75 = wardLSTs[Math.floor(wardLSTs.length * 0.75)];

        // Pass 3: Risk Classification
        const finalMap = {};
        Object.keys(tempMap).forEach(key => {
            const wardData = tempMap[key];
            const ndviVal = this.ndviTable[key]?.mean || 0; // Cached NDVI access

            const risk = calculateHeatRisk(wardData.meanLst, ndviVal, p25, p75);

            let heatLevel = "MODERATE";
            if (wardData.meanLst > p75) heatLevel = "HIGH";
            else if (wardData.meanLst < p25) heatLevel = "LOW";

            finalMap[key] = {
                ...wardData,
                ndviMean: ndviVal,
                heatLevel,
                risk
            };
        });
        this.heatTable = finalMap;
    }
}

export const EnvironmentalDataManager = new EnvironmentalDataManagerService();
