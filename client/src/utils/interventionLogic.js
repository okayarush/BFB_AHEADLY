import { getAvailableInterventions } from "../constants/interventionImpactMap";

/**
 * Ranks interventions based on environmental contributors and primary disease signal.
 * Centralized logic to ensure consistency between Intervention Planner and Policy Brief.
 * 
 * @param {Object} contributors - HRI contributors object (e.g. { vectorDensity: 0.8, ... })
 * @param {Object} diseaseSignal - The full disease signal object from formatDiseaseSignalFromData
 * @returns {Array} - Squared array of interventions, sorted by relevance.
 */
export const rankInterventions = (contributors, diseaseSignal) => {
    const all = getAvailableInterventions();
    const primaryDisease = diseaseSignal?.primary;

    return all.map(i => {
        let r = 0;

        // 1. Environmental Driver Match
        if (i.riskDrivers) {
            i.riskDrivers.forEach(d => {
                if (contributors && contributors[d]) {
                    r += contributors[d];
                }
            });
        }

        // 2. Clinical Match (Disease Specific)
        if (primaryDisease) {
            if (primaryDisease.type === 'Vector-Borne') {
                if (i.id === 'fogging-campaign') r += 1.5; // High priority for active vector transmission
                if (i.id === 'disease-surveillance') r += 1.0;
                if (i.id === 'source-reduction') r += 0.8;
            }
            else if (primaryDisease.type === 'Water-Borne') {
                if (i.id === 'sanitation-response') r += 1.5; // Immediate sanitation fix
                if (i.id === 'chlorine-distribution') r += 1.0; // Assume exists or map to similar
                if (i.id === 'drain-desilting') r += 0.8;
            }
            else if (primaryDisease.type === 'Respiratory') {
                if (i.id === 'mobile-health-camp') r += 1.0; // Symptomatic relief
            }
        }

        // 3. Generic Health boost
        if (i.name && i.name.toLowerCase().includes('health')) r += 0.2;

        return { ...i, relevance: r };
    }).sort((a, b) => b.relevance - a.relevance);
};
