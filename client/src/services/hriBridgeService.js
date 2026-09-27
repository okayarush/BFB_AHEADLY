import { EnvironmentalDataManager } from "../utils/EnvironmentalDataManager";
import { DiseaseDataManager } from "../utils/DiseaseDataManager";
import { CommunityIntelligenceManager } from "../utils/CommunityIntelligenceManager";
import { getHRIScore } from "../utils/RiskCalculator";
import { getSectorID } from "../utils/HospitalRegistry";
import { generateDiseaseSignal } from "./diseaseService";

/**
 * HRI Bridge Service
 * 
 * STRICT ARCHITECTURE RULE:
 * This service is a READ-ONLY bridge to the Digital Twin's HRI data.
 * It must NOT perform any calculations or modify HRI scores.
 * It exists solely to provide the authoritative "Baseline HRI" to the Intervention Planner.
 */

class HRIBridgeService {
    /**
     * Fetch the authoritative Baseline HRI for a specific ward.
     * In a real implementation, this would query the Digital Twin's state or backend.
     * Currently mocks the data structure to strictly enforce the read-only contract.
     * 
     * @param {string} wardId - The unique identifier for the ward
     * @returns {Promise<Object>} The baseline HRI data object
     */
    async getBaselineHRIFromTwin(wardId) {
        // STRICT ARCHITECTURE: Use Shared Managers (Single Source of Truth)
        // 1. Ensure Environmental Data is loaded
        if (!EnvironmentalDataManager.isLoaded()) {
            await EnvironmentalDataManager.initialize();
        }

        // 2. Resolve IDs
        const wardName = wardId;
        const sectorId = getSectorID(wardName); // Maps Ward Name -> Sector ID (e.g. "Sector-01")

        // 3. Fetch Data Components
        const diseaseData = DiseaseDataManager.getWardAggregates()[sectorId] || { level: "LOW" };
        const sanitationData = CommunityIntelligenceManager.getSectorRisk(sectorId);

        const heatData = EnvironmentalDataManager.getHeatRecord(wardName) || { risk: "LOW" };
        const stagnationData = EnvironmentalDataManager.getStagnationRecord(wardName) || { level: "LOW" };
        const ndviData = EnvironmentalDataManager.getNDVIRecord(wardName) || { mean: 0.6 };

        // 4. Compute Shared HRI Score (EXACT MATCH to Digital Twin)
        const { score, category, breakdown } = getHRIScore(
            diseaseData.level,
            heatData.risk,
            stagnationData.level,
            ndviData.mean,
            sanitationData.level
        );

        // 5. Map Scaling for UI (0-3 scale for bars)
        // We map the qualitative levels to the numeric values used in HRI calculation
        // HRI Logic:
        // Disease: HIGH=4, MED=2 -> Map to 3, 1.5
        // Heat: EXTREME=3, HIGH=2 -> Map to 3, 2
        // Stagnation: HIGH=2 -> Map to 2
        // Sanitation: HIGH=2, MED=1 -> Map to 2, 1

        const contributors = {
            diseaseBurden: diseaseData.level === "HIGH" ? 3 : (diseaseData.level === "MEDIUM" ? 1.5 : 0.5),
            heatExposure: heatData.risk === "EXTREME" ? 3 : (heatData.risk === "HIGH" ? 2 : 0.5),
            waterStagnation: stagnationData.level === "HIGH" ? 2 : (stagnationData.level === "MEDIUM" ? 1 : 0),
            sanitationStress: sanitationData.level === "HIGH" ? 2 : (sanitationData.level === "MEDIUM" ? 1 : 0),
            vectorDensity: ndviData.mean < 0.3 ? 1.5 : 0.5 // Proxy for NDVI risk
        };

        return {
            wardId: wardId,
            score: score, // 0-12 Integer
            category: category,
            contributors: contributors, // Mapped for UI visualization
            explanation: this._generateExplanation(category, breakdown, contributors),
            disease: generateDiseaseSignal(
                wardName,
                score,
                sanitationData.level === "HIGH" ? 0.9 : 0.4,
                ndviData.mean < 0.3 ? 0.8 : 0.2
            )
        };
    }

    _generateExplanation(category, breakdown, contributors) {
        if (category === "CRITICAL") return "Critical structural risks detected. Overlapping environmental and disease vectors require immediate intervention.";
        if (category === "HIGH") return "High risk levels driven by verified disease signals and environmental stressors.";
        if (category === "MODERATE") return "Emerging risks detected. Preventive monitoring recommended to avoid escalation.";
        return "Conditions are currently stable. Routine monitoring is sufficient.";
    }

    /**
     * Helper to determine category from score (0-12 scale).
     * This logic mirrors the Twin's categorization logic but does not redefine it.
     */
    _getCategory(score) {
        if (score >= 9) return 'Critical';
        if (score >= 6) return 'High';
        if (score >= 3) return 'Moderate';
        return 'Good';
    }
}

export const hriBridgeService = new HRIBridgeService();
