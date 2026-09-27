
// Logic extracted from DigitalTwin.js for shared use

/* ===================== NDVI LOGIC ===================== */
export const getNDVIStatus = (mean) => {
    if (mean < 0.3) return "Sparse vegetation";
    if (mean < 0.5) return "Moderate vegetation";
    return "Dense vegetation";
};

export const getNDVIReason = (status) => {
    switch (status) {
        case "Sparse vegetation":
            return "Sparse vegetation can increase surface heat and reduce natural drainage, potentially worsening heat stress and supporting mosquito breeding near stagnant water.";
        case "Moderate vegetation":
            return "Moderate vegetation offers partial cooling and drainage benefits, but localized environmental stress may still contribute to vector-borne disease risk.";
        case "Dense vegetation":
            return "Dense vegetation improves cooling and soil absorption, which can help reduce heat stress and limit conditions favorable for mosquito breeding.";
        default:
            return "Data unavailable";
    }
};

export const getNDVIColor = (mean) => {
    if (mean < 0.15) return "#dc2626"; // Red (Very Low)
    if (mean < 0.25) return "#f59e0b"; // Orange (Low-Mod)
    return "#16a34a"; // Green (Healthy)
};

/* ===================== WATER STAGNATION LOGIC ===================== */
export const getWaterStagnationSusceptibility = (ndviMean, totalArea) => {
    const lowVegetation = ndviMean < 0.38;
    const largeWard = totalArea > 15;

    if (lowVegetation && largeWard) return "HIGH";
    if (lowVegetation || largeWard) return "MEDIUM";
    return "LOW";
};

export const getStagnationReason = (level) => {
    switch (level) {
        case "HIGH":
            return "Low vegetation cover combined with large ward area increases susceptibility to water stagnation during rainfall, elevating dengue and malaria risk.";
        case "MEDIUM":
            return "Either limited vegetation or ward scale may allow temporary water stagnation, which can support mosquito breeding after rainfall.";
        case "LOW":
            return "Vegetation cover and ward characteristics reduce the likelihood of persistent water stagnation, lowering immediate vector-borne disease risk.";
        default:
            return "Data unavailable";
    }
};

export const getStagnationColor = (level) => {
    switch (level) {
        case "HIGH": return "#e74c3c";   // Red
        case "MEDIUM": return "#f97316"; // Orange
        case "LOW": return "#2ecc71";    // Green
        default: return "rgba(59,130,246,0.25)";
    }
};

/* ===================== URBAN HEAT HEALTH LOGIC ===================== */
export const getHeatRiskColor = (level) => {
    switch (level) {
        case "EXTREME": return "#800026"; // Dark Red
        case "HIGH": return "#e31a1c";    // Red
        case "MODERATE": return "#fd8d3c"; // Orange
        case "LOW": return "#31a354";     // Green
        default: return "rgba(59,130,246,0.25)";
    }
};

export const getHeatRiskReason = (level) => {
    switch (level) {
        case "EXTREME":
            return "High relative surface temperatures combined with low vegetation cover increase heat stress exposure, raising the risk of heat exhaustion, heat stroke, and cardiovascular strain, especially among elderly residents and outdoor workers.";
        case "HIGH":
            return "Elevated surface temperatures or limited vegetation reduce natural cooling, potentially increasing heat-related illness risk and worsening living conditions during warm periods.";
        case "MODERATE":
            return "Moderate heat exposure and partial vegetation cover provide some thermal relief, but vulnerable populations may still experience heat discomfort.";
        case "LOW":
            return "Lower relative temperatures and adequate vegetation help regulate surface heat, reducing heat-related health risks.";
        default:
            return "Data unavailable";
    }
};

export const calculateHeatRisk = (meanLst, ndviVal, p25, p75) => {
    // Step A: Relative Heat
    let heatLevel = "MODERATE";
    if (meanLst > p75) heatLevel = "HIGH";
    else if (meanLst < p25) heatLevel = "LOW";

    // Step B: Vegetation
    let vegLevel = "HIGH";
    if (ndviVal < 0.35) vegLevel = "LOW";
    else if (ndviVal < 0.5) vegLevel = "MODERATE";

    // Step C: Combined Risk
    let risk = "LOW";
    if (heatLevel === "HIGH" && vegLevel === "LOW") {
        return "EXTREME";
    } else if (heatLevel === "HIGH" || vegLevel === "LOW") {
        return "HIGH";
    } else if (heatLevel === "MODERATE" || vegLevel === "MODERATE") {
        return "MODERATE";
    }
    return "LOW";
};

/* ===================== DISEASE SIGNALS LOGIC ===================== */
export const getTrendArrow = (trend) => {
    if (trend === "UP") return "↑";
    if (trend === "DOWN") return "↓";
    return "→";
};

export const getDiseaseColor = (level) => {
    switch (level) {
        case "HIGH": return "#c0392b";   // Dark Red
        case "MEDIUM": return "#f39c12"; // Orange
        case "LOW": return "#27ae60";    // Green
        default: return "rgba(59,130,246,0.25)";
    }
};

export const getDiseaseReason = (level, dominantType) => {
    if (level === "HIGH") {
        if (dominantType === "Fever") return "High fever case burden indicates active transmission risk. Combined with local environmental stressors, this sector may require immediate fever surveillance, vector-control measures, and clinic surge preparedness.";
        if (dominantType === "Diarrhea") return "Elevated diarrhea cases suggest possible water or sanitation exposure. Immediate inspection of drinking water sources and hygiene advisories are recommended.";
        if (dominantType === "Respiratory") return "Rising respiratory cases may be linked to heat stress or air-quality conditions. Public advisories for vulnerable groups and clinic readiness are advised.";
        return "High disease activity detected. Immediate surveillance advised.";
    }
    if (level === "MEDIUM") {
        if (dominantType === "Fever") return "Moderate fever cases indicate localized transmission that may escalate without early intervention. Enhanced monitoring is recommended.";
        if (dominantType === "Diarrhea") return "Moderate diarrhea cases suggest short-term water or hygiene concerns. Preventive checks and awareness measures are advised.";
        if (dominantType === "Respiratory") return "Moderate respiratory symptoms may reflect environmental or seasonal stress. Continued surveillance is recommended.";
        return "Moderate disease signals detected. Monitoring recommended.";
    }
    // LOW
    return "Reported case counts remain low and stable. No immediate intervention is required beyond routine monitoring.";
};

/* ===================== HRI SCORING LOGIC ===================== */
export const getHRIScore = (diseaseLevel, heatRisk, stagnationLevel, ndviMean, sanitationRisk) => {
    let score = 0;
    const breakdown = [];

    // Disease Signals
    if (diseaseLevel === "HIGH") { score += 4; breakdown.push("Elevated disease burden (+4)"); }
    else if (diseaseLevel === "MEDIUM") { score += 2; breakdown.push("Moderate disease activity (+2)"); }

    // Urban Heat
    if (heatRisk === "EXTREME") { score += 3; breakdown.push("Critical urban heat stress (+3)"); }
    else if (heatRisk === "HIGH") { score += 2; breakdown.push("High heat exposure (+2)"); }

    // Water Stagnation
    if (stagnationLevel === "HIGH") { score += 2; breakdown.push("High water stagnation risk (+2)"); }

    // NDVI
    if (ndviMean < 0.3) { score += 1; breakdown.push("Low vegetation cover (+1)"); }

    // Sanitation Risk
    if (sanitationRisk === "HIGH") { score += 2; breakdown.push("Severe sanitation stress (+2)"); }
    else if (sanitationRisk === "MEDIUM") { score += 1; breakdown.push("Moderate sanitation issues (+1)"); }

    // Categorize
    let category = "LOW";
    // Recalibrated Thresholds
    if (score >= 10) category = "CRITICAL";
    else if (score >= 7) category = "HIGH";
    else if (score >= 4) category = "MODERATE";

    return { score, category, breakdown };
};

export const getHRIColor = (category) => {
    switch (category) {
        case "CRITICAL": return "#7f1d1d"; // Deep Red / Burgundy
        case "HIGH": return "#ef4444";     // Red
        case "MODERATE": return "#f59e0b"; // Amber/Orange
        case "LOW": return "#10b981";      // Emerald Green
        default: return "#9ca3af";
    }
};
