import { SECTOR_LIST } from './HospitalRegistry';

const STORAGE_KEY = 'urbanome_disease_state_v4'; // Versioned to force clear old data
const LEGACY_STORAGE_KEYS = ['urbanome_disease_state_v3'];

const DISEASE_KEYS = ['dengue', 'malaria', 'chikungunya', 'ari', 'ili', 'add', 'typhoid', 'cholera', 'heat'];

const buildCounts = (overrides = {}) => {
    const counts = {};
    DISEASE_KEYS.forEach((key) => {
        counts[key] = overrides[key] || 0;
    });
    return counts;
};

const buildSignal = (primaryKey, cases, overrides) => ({
    counts: buildCounts({ [primaryKey]: cases }),
    meta: {
        primaryKey,
        ...overrides
    }
});

const FIXED_SECTOR_SIGNALS = {
    'Sector-01': buildSignal('typhoid', 14, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Typhoid',
        transmission: 'Contaminated water/food',
        cluster: 'Cluster'
    }),
    'Sector-02': buildSignal('malaria', 3, {
        trend: 'Stable',
        priority: 'MODERATE',
        displayName: 'Malaria',
        transmission: 'Anopheles mosquito (Night biter)',
        cluster: 'Sporadic'
    }),
    'Sector-03': buildSignal('dengue', 31, {
        trend: 'Outbreak',
        priority: 'CRITICAL',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Outbreak'
    }),
    'Sector-05': buildSignal('add', 8, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Diarrhoea',
        transmission: 'Waterborne — open drain exposure',
        cluster: 'Cluster'
    }),
    'Sector-06': buildSignal('dengue', 5, {
        trend: 'Stable',
        priority: 'LOW',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Sporadic'
    }),
    'Sector-07': buildSignal('ari', 19, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Respiratory',
        transmission: 'Airborne — high PM2.5 + humidity',
        cluster: 'Cluster'
    }),
    'Sector-08': buildSignal('dengue', 27, {
        trend: 'Outbreak',
        priority: 'CRITICAL',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Outbreak'
    }),
    'Sector-09': buildSignal('typhoid', 11, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Typhoid',
        transmission: 'Contaminated water/food',
        cluster: 'Cluster'
    }),
    'Sector-10': buildSignal('dengue', 22, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Cluster'
    }),
    'Sector-11': buildSignal('malaria', 2, {
        trend: 'Stable',
        priority: 'LOW',
        displayName: 'Malaria',
        transmission: 'Anopheles mosquito (Night biter)',
        cluster: 'Sporadic'
    }),
    'Sector-12': buildSignal('dengue', 18, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Cluster'
    }),
    'Sector-13': buildSignal('cholera', 6, {
        trend: 'Rising',
        priority: 'HIGH',
        displayName: 'Cholera',
        transmission: 'Contaminated water source',
        cluster: 'Cluster'
    }),
    'Sector-14': buildSignal('ari', 4, {
        trend: 'Stable',
        priority: 'MODERATE',
        displayName: 'Respiratory',
        transmission: 'Airborne — high PM2.5 + humidity',
        cluster: 'Sporadic'
    }),
    'Sector-15': buildSignal('add', 1, {
        trend: 'Stable',
        priority: 'LOW',
        displayName: 'Diarrhoea',
        transmission: 'Waterborne — open drain exposure',
        cluster: 'Sporadic'
    }),
    'Sector-16': buildSignal('dengue', 9, {
        trend: 'Stable',
        priority: 'MODERATE',
        displayName: 'Dengue',
        transmission: 'Aedes aegypti (Day biter)',
        cluster: 'Sporadic'
    })
};

const buildModerateCounts = () => ({
    dengue: Math.floor(Math.random() * 3),
    malaria: Math.floor(Math.random() * 2),
    chikungunya: 0,
    ari: Math.floor(Math.random() * 4),
    ili: Math.floor(Math.random() * 2),
    add: Math.floor(Math.random() * 2),
    typhoid: 0,
    cholera: 0,
    heat: Math.floor(Math.random() * 2)
});

const buildHealthyCounts = () => ({
    dengue: Math.floor(Math.random() * 2),
    malaria: 0,
    chikungunya: 0,
    ari: Math.floor(Math.random() * 2),
    ili: 0,
    add: 0,
    typhoid: 0,
    cholera: 0,
    heat: 0
});

const sumCases = (counts) => DISEASE_KEYS.reduce((acc, key) => acc + (counts[key] || 0), 0);

export class DiseaseDataManager {

    // --- INITIALIZATION ---
    static initializeBaselineData() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) return; // Data exists, do nothing
        // Ensure we drop the old seed whenever we bump the key so the new fixtures land
        LEGACY_STORAGE_KEYS.forEach((legacyKey) => localStorage.removeItem(legacyKey));

        const mockData = {};

        SECTOR_LIST.forEach((sector) => {
            const fixture = FIXED_SECTOR_SIGNALS[sector];
            const counts = fixture ? { ...fixture.counts } : (Math.random() > 0.8 ? buildModerateCounts() : buildHealthyCounts());
            const total = sumCases(counts);
            const level = this.computeLevel(total);

            mockData[sector] = {
                ...counts,
                total,
                level,
                dominantType: this.computeDominantType(counts)
            };

            if (fixture && fixture.meta) {
                mockData[sector].meta = { ...fixture.meta };
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
        console.log("Initialized Foolproof Baseline Data (Sector-XX)");
    }

    // --- READ ---
    static getWardAggregates() {
        this.initializeBaselineData();
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : {};
    }

    // --- WRITE ---
    static saveReport(report) {
        const currentData = this.getWardAggregates();
        const sector = report.ward;

        if (!currentData[sector]) {
            // Should not happen, but safeguard
            currentData[sector] = {
                dengue: 0, malaria: 0, chikungunya: 0,
                add: 0, cholera: 0, typhoid: 0,
                ari: 0, ili: 0,
                heat: 0,
                total: 0, level: "LOW", dominantType: "None"
            };
        }

        // ADD counts - Vector
        currentData[sector].dengue = (currentData[sector].dengue || 0) + (parseInt(report.dengue) || 0);
        currentData[sector].malaria = (currentData[sector].malaria || 0) + (parseInt(report.malaria) || 0);
        currentData[sector].chikungunya = (currentData[sector].chikungunya || 0) + (parseInt(report.chikungunya) || 0);

        // ADD counts - Water
        currentData[sector].add = (currentData[sector].add || 0) + (parseInt(report.add) || 0);
        currentData[sector].cholera = (currentData[sector].cholera || 0) + (parseInt(report.cholera) || 0);
        currentData[sector].typhoid = (currentData[sector].typhoid || 0) + (parseInt(report.typhoid) || 0);

        // ADD counts - Respiratory
        currentData[sector].ari = (currentData[sector].ari || 0) + (parseInt(report.ari) || 0);
        currentData[sector].ili = (currentData[sector].ili || 0) + (parseInt(report.ili) || 0);

        // ADD counts - Heat
        currentData[sector].heat = (currentData[sector].heat || 0) + (parseInt(report.heat) || 0);

        // Recompute Total
        const total =
            currentData[sector].dengue + currentData[sector].malaria + currentData[sector].chikungunya +
            currentData[sector].add + currentData[sector].cholera + currentData[sector].typhoid +
            currentData[sector].ari + currentData[sector].ili +
            currentData[sector].heat;

        currentData[sector].total = total;
        currentData[sector].level = this.computeLevel(total);
        currentData[sector].dominantType = this.computeDominantType(currentData[sector]);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

        // Dispatch Global Event
        window.dispatchEvent(new Event('urbanome-data-update'));

        return true;
    }

    // --- HELPERS ---
    static computeLevel(total) {
        if (total >= 16) return "HIGH";
        if (total >= 8) return "MEDIUM";
        return "LOW";
    }

    static computeDominantType(data) {
        // Group totals
        const vector = (data.dengue || 0) + (data.malaria || 0) + (data.chikungunya || 0);
        const water = (data.add || 0) + (data.cholera || 0) + (data.typhoid || 0);
        const respiratory = (data.ari || 0) + (data.ili || 0);
        const heat = (data.heat || 0);

        const max = Math.max(vector, water, respiratory, heat);

        if (max === 0) return "None";
        if (vector === max) return "Vector-Borne";
        if (water === max) return "Water-Borne";
        if (respiratory === max) return "Respiratory";
        return "Heat-Related";
    }
}
