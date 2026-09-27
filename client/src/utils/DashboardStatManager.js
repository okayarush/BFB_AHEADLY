
import { DiseaseDataManager } from "./DiseaseDataManager";
import { CommunityIntelligenceManager } from "./CommunityIntelligenceManager";
import { getHRIScore } from "./RiskCalculator";
import { getSectorID } from "./HospitalRegistry";
import { EnvironmentalDataManager } from "./EnvironmentalDataManager";

// Cache to prevent re-fetching on every render if dashboard is re-mounted
let cachedData = null;

export const DashboardStatManager = {

    // Main function to get the full city snapshot
    getCityOverview: async () => {
        if (cachedData) return cachedData;

        try {
            // 1. Load all environmental data via the single source of truth
            await EnvironmentalDataManager.initialize();
            const ndviMap = EnvironmentalDataManager.getAllNDVIData();
            const stagnationMap = EnvironmentalDataManager.getAllStagnationData();
            const heatMap = EnvironmentalDataManager.getAllHeatData();

            // 4. Get Dynamic Data
            const diseaseData = DiseaseDataManager.getWardAggregates();
            const sanitationReports = CommunityIntelligenceManager.getAllReports();
            const sanitationRiskMap = CommunityIntelligenceManager.getRiskTable();

            // 5. Aggregate Ward-Level HRI
            let totalHRIScore = 0;
            let wardCount = 0;
            let highRiskWards = 0;
            let moderateRiskWards = 0;
            let heatHotspots = 0;
            let stagnationWards = 0;

            const wardRisks = [];

            // Iterate over all known wards (Union of keys)
            // Ideally we use a master ward list. We can use keys from ndviMap as a proxy for all wards.
            const allWards = Object.keys(ndviMap);

            allWards.forEach(wardKey => {
                // Resolve Sector ID from Ward Name (e.g. "Ward 1" -> "Sector-01")
                // Ward names in CSV might be "Ward 1", "Ward 2" etc.
                // DigitalTwin uses `getSectorID` on `feature.properties.Name`.
                // Here we have `wardKey` which is `name` column from CSV (usually "Ward 1").
                // `getSectorID` expects "Ward 1".
                // CSV parser lowercases names, so "ward 1".
                // HRI Logic requires SectorID for Disease/Sanitation matches.

                // Capitalize for getSectorID if needed? getSectorID handles strings.
                // It likely maps "Ward 1" -> "Sector-01".

                const sectorId = getSectorID(wardKey);

                const nData = ndviMap[wardKey] || { mean: 0.6 };
                const sData = stagnationMap[wardKey] || { level: "LOW" };
                const hData = heatMap[wardKey] || { risk: "LOW" };
                const dData = diseaseData[sectorId] || { level: "LOW" };
                const cData = sanitationRiskMap[sectorId] || { level: "LOW" };

                // Calculate HRI
                const { score, category, breakdown } = getHRIScore(
                    dData.level,
                    hData.risk,
                    sData.level,
                    nData.mean,
                    cData.level
                );

                // Stats Aggregation
                totalHRIScore += score;
                wardCount++;

                if (category === "CRITICAL" || category === "HIGH") highRiskWards++;
                if (category === "MODERATE") moderateRiskWards++;
                if (hData.risk === "EXTREME" || hData.risk === "HIGH") heatHotspots++;
                if (sData.level === "HIGH") stagnationWards++;

                wardRisks.push({
                    ward: wardKey,
                    sector: sectorId,
                    score,
                    category,
                    breakdown,
                    hriColor: category === "CRITICAL" || category === "HIGH" ? "red" : category === "MODERATE" ? "orange" : "green"
                });
            });

            // 6. Final City Metrics
            const avgScoreOriginal = wardCount > 0 ? (totalHRIScore / wardCount) : 0;
            // Normalize 0-12 to 0-10
            const cityHRI = (avgScoreOriginal / 12) * 10;

            let cityStatus = "Good";
            if (cityHRI > 6) cityStatus = "Critical"; // > 7.2 on 12 scale
            else if (cityHRI > 4) cityStatus = "High Risk"; // > 4.8 on 12 scale
            else if (cityHRI > 2) cityStatus = "Moderate"; // > 2.4 on 12 scale

            // 7. Recent Signals (Last 7 days)
            const recentSignals = generateSignals(diseaseData, sanitationReports, heatMap);

            // 8. Risk Drivers
            const riskDrivers = generateRiskDrivers(highRiskWards, heatHotspots, stagnationWards, sanitationReports);

            const result = {
                cityHRI: cityHRI.toFixed(1),
                cityStatus,
                highRiskWards,
                moderateRiskWards,
                heatHotspots,
                stagnationWards,
                activeReports: countActiveReports(sanitationReports),
                recentSignals,
                riskDrivers,
                wardRisks
            };

            cachedData = result;
            return result;

        } catch (error) {
            console.error("DashboardStatManager Error:", error);
            return null;
        }
    }
};


/* ===================== HELPERS ===================== */

function countActiveReports(reports) {
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return reports.filter(r => new Date(r.timestamp) >= sevenDaysAgo).length;
}

function generateSignals(diseaseData, sanitationReports, heatMap) {
    const signals = [];

    // 1. Disease Spikes
    Object.keys(diseaseData).forEach(sector => {
        const data = diseaseData[sector];
        if (data.level === "HIGH") {
            signals.push({
                id: `dis-${sector}`,
                type: "MEDICAL",
                icon: "⚠️",
                header: `${sector}: Medical Alert`,
                message: `High ${data.dominantType.toLowerCase()} cases reported.`,
                time: "Current"
            });
        }
    });

    // 2. Sanitation Clusters
    // Group reports by sector
    const sectorCounts = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sanitationReports.forEach(r => {
        if (new Date(r.timestamp) >= sevenDaysAgo) {
            sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1;
        }
    });

    Object.entries(sectorCounts).forEach(([sector, count]) => {
        if (count >= 5) {
            signals.push({
                id: `san-${sector}`,
                type: "SANITATION",
                icon: "🧹",
                header: `${sector}: Sanitation`,
                message: `${count} active complaints in last 7 days.`,
                time: "Last 7d"
            });
        }
    });

    // 3. Heat Anomalies (Top 3 hottest)
    // Sort heatMap by LST
    const hottest = Object.entries(heatMap)
        .sort(([, a], [, b]) => b.meanLst - a.meanLst)
        .slice(0, 3);

    hottest.forEach(([wardKey, data]) => {
        if (data.risk === "EXTREME") {
            signals.push({
                id: `heat-${wardKey}`,
                type: "HEAT",
                icon: "🌡️",
                header: `${wardKey}: Extreme Heat`,
                message: `Surface temp anomaly detected (${data.meanLst.toFixed(1)}°C).`,
                time: "Real-time"
            });
        }
    });

    // Limit to 5
    return signals.slice(0, 5);
}

function generateRiskDrivers(highRiskWards, heatHotspots, stagnationWards, reports) {
    const drivers = [];

    if (highRiskWards > 5) drivers.push("Widespread Multi-Factor Risk across city wards");
    if (heatHotspots > 3) drivers.push("High heat exposure in central wards due to low vegetation");
    if (stagnationWards > 4) drivers.push("Likely water stagnation areas increasing vector risk");

    const recentReportCount = countActiveReports(reports);
    if (recentReportCount > 20) drivers.push(`Surge in citizen sanitation reports (${recentReportCount} active)`);

    // Fallbacks
    if (drivers.length < 2) drivers.push("Low vegetation cover reducing urban cooling efficiency");
    if (drivers.length < 3) drivers.push("Localized sanitation issues needing municipal attention");

    return drivers.slice(0, 4);
}
