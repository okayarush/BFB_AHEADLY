/**
 * Intervention Impact Map
 * 
 * STRICT ARCHITECTURE RULE:
 * This file defines STATIC IMPACT DELTAS.
 * It does NOT contain formulas or dynamic logic.
 * It maps an Intervention Type -> Component Delta (Magnitude/Direction).
 */

export const INTERVENTION_IMPACT_MAP = {
    'mobile-health-camp': {
        name: "Mobile Health Camp",
        description: "Deploying rapid response medical teams to high, acute-risk zones.",
        riskDrivers: ['vectorDensity', 'sanitationStress'],
        affectedComponents: {
            vectorDensity: -2.0,
            sanitationStress: -1.0
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Immediate",
        responsibleDepartment: "Health Dept. (Epidemic Cell)",
        target: "Symptomatic fever & gastro cases in high-density pockets",
        impactRationale: "Early diagnosis isolates carriers, preventing secondary cluster formation.",
        executionSteps: [
            "Step 1: Setup triage tents in community center/school.",
            "Step 2: Rapid Testing (RDT) for all febrile patients.",
            "Step 3: Distribute free meds & refer criticals to UHC."
        ],
        resourceRequirements: {
            manpower: "2 Doctors, 3 Nurses, 4 Volunteers",
            vehicles: "1 Mobile Health Van (Equipped with PA System)",
            equipment: "500 RDT Kits, Basic Medicine Stock, ORS/Zinc"
        },
        specificTimeline: "Day 0: Setup | Day 1-3: Active Screening | Day 7: Impact Review",
        successMetric: ">80% screening of symptomatic residents within 3 days",
        expectedHealthImpact: "Immediate reduction in untreated morbidity; prevents progression of acute outbreaks."
    },
    'disease-surveillance': {
        name: "Intensified Surveillance",
        description: "Active case finding and larval surveys in hotspot wards.",
        riskDrivers: ['vectorDensity', 'waterStagnation'],
        affectedComponents: {
            vectorDensity: -1.5,
            waterStagnation: -0.5
        },
        feasibility: "Medium",
        costCategory: "Low",
        effort: "Ongoing",
        responsibleDepartment: "Health Dept. (Surveillance Unit)",
        target: "Hidden/Unreported cases & indoor breeding sites",
        impactRationale: "Identifies micro-clusters before they expand into outbreaks.",
        executionSteps: [
            "Step 1: House-to-House (H2H) survey by ASHA workers.",
            "Step 2: Collect blood smears/samples from fever cases.",
            "Step 3: GIS tagging of positive households."
        ],
        resourceRequirements: {
            manpower: "10 ASHA Workers, 2 Sanitary Inspectors",
            vehicles: "2 Two-wheelers for supervisors",
            equipment: "Tablets for Data Entry, Sample Collection Kits"
        },
        specificTimeline: "Day 0: Team briefing | Day 1-5: 100% Ward Coverage | Day 7: Data Analysis",
        successMetric: "100% household coverage; Identification of all fever cases",
        expectedHealthImpact: "Early detection of outbreak clusters allows for preemptive containment."
    },
    'fogging-campaign': {
        name: "Targeted Fogging",
        description: "Emergency vector control measure in high-risk zones.",
        riskDrivers: ['vectorDensity'],
        affectedComponents: {
            vectorDensity: -2.5
        },
        feasibility: "High",
        costCategory: "Medium",
        effort: "Immediate",
        responsibleDepartment: "Vector Control Dept.",
        target: "Adult Aedes aegypti / Anopheles mosquitoes",
        impactRationale: "Instantly knocks down adult vector population, breaking transmission chain.",
        executionSteps: [
            "Step 1: Vehicle-mounted fogging in main streets.",
            "Step 2: Hand-held thermal fogging in narrow lanes.",
            "Step 3: Resident advisory to keep doors/windows open."
        ],
        resourceRequirements: {
            manpower: "4 Fogging Operators, 1 Supervisor",
            vehicles: "1 Pickup Truck (Mount), 2 Hand-foggers",
            equipment: "Malathion/Cyphenothrin solution, PPE Kits"
        },
        specificTimeline: "Day 0: Evening Fogging | Day 1: Morning Fogging | Day 3: Repeat Cycle",
        successMetric: ">90% reduction in adult mosquito density (Landing Rate)",
        expectedHealthImpact: "Rapidly knocks down adult mosquito population, breaking immediate disease transmission cycles."
    },
    'sanitation-response': {
        name: "Sanitation Rapid Response",
        description: "Emergency cleanup of open dumps and overflow drains.",
        riskDrivers: ['sanitationStress', 'vectorDensity'],
        affectedComponents: {
            sanitationStress: -2.0,
            vectorDensity: -1.0
        },
        feasibility: "High",
        costCategory: "Medium",
        effort: "Immediate",
        responsibleDepartment: "Solid Waste Management (SWM) Dept.",
        target: "Garbage blackspots & overflowing bacterial sources",
        impactRationale: "Removes breeding substrate for flies and mosquitoes.",
        executionSteps: [
            "Step 1: JCB removal of accumulated waste piles.",
            "Step 2: Bleaching powder dusting on cleared sites.",
            "Step 3: Repair of broken community bins."
        ],
        resourceRequirements: {
            manpower: "8 Sanitation Workers, 1 Mukadam",
            vehicles: "1 Refuse Compactor, 1 Mini-Tipper",
            equipment: "Shovels, Brooms, Bleaching Powder (50kg)"
        },
        specificTimeline: "Day 0: Clearance | Day 1: Disinfection | Day 2: Monitoring",
        successMetric: "Zero visible garbage piles; cleared drainage flow",
        expectedHealthImpact: "Removes immediate pathogen sources and breeding grounds, reducing enteric and vector risk."
    },
    'drain-desilting': {
        name: "Drain Desilting",
        description: "Clearing clogged drains to improve flow.",
        riskDrivers: ['waterStagnation', 'vectorDensity'],
        affectedComponents: {
            waterStagnation: -1.5,
            sanitationStress: -0.5,
            vectorDensity: -0.5
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Short-term",
        responsibleDepartment: "Drainage / Civil Works Dept.",
        target: "Stagnant water in stormwater drains (Nallahs)",
        impactRationale: "Restores flow, eliminating stable breeding surface for larvae.",
        executionSteps: [
            "Step 1: Manual/Mechanical removal of silt & debris.",
            "Step 2: Transport of sludge to landfill.",
            "Step 3: Anti-larval spraying on remaining pockets."
        ],
        resourceRequirements: {
            manpower: "6 Contract Labours, 1 Site Supervisor",
            vehicles: "1 Desilting Machine / JCB",
            equipment: "Gumboots, Gloves, Spade, Sludge Pump"
        },
        specificTimeline: "Day 0-2: Desilting | Day 3: Disposal",
        successMetric: "Free flow of water in major ward arteries",
        expectedHealthImpact: "Reduces standing water, lowering dengue/malaria vector breeding potential."
    },
    'cool-roofing': {
        name: "Cool Roofing",
        description: "Painting roofs white to lower indoor temps.",
        riskDrivers: ['heatExposure'],
        affectedComponents: {
            heatExposure: -2.0
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Short-term",
        responsibleDepartment: "Urban Planning / Slum Improvement Dept.",
        target: "High-density slum households with tin roofs",
        impactRationale: "Passive cooling reduces heat stress morbidity.",
        executionSteps: [
            "Step 1: Identify eligible low-income households.",
            "Step 2: Surface cleaning & primer application.",
            "Step 3: Two coats of high-albedo white paint."
        ],
        resourceRequirements: {
            manpower: "4 Painters, 2 Volunteers",
            vehicles: "1 Material Transport Tempo",
            equipment: "Paint Brushes, Rollers, Safety Harness"
        },
        specificTimeline: "Day 0: Survey | Day 1-5: Application",
        successMetric: "3-5°C reduction in indoor temperature",
        expectedHealthImpact: "Lowers indoor temperatures by 3-5°C, significantly reducing heat stress."
    },
    'community-advisory': {
        name: "Community Advisory",
        description: "Public health broadcast to residents.",
        riskDrivers: [],
        affectedComponents: { heatExposure: -0.5 },
        feasibility: "High", costCategory: "Low", effort: "Immediate",
        responsibleDepartment: "PR Dept.",
        target: "General Public",
        impactRationale: "Increases awareness and personal protection.",
        executionSteps: ["Step 1: Draft message.", "Step 2: Broadcast via SMS/WhatsApp.", "Step 3: Local PA system announcements."],
        resourceRequirements: { manpower: "1 Officer", vehicles: "None", equipment: "None" },
        specificTimeline: "Day 0", successMetric: "Reach 80% residents", expectedHealthImpact: "Reduces exposure by increasing personal protective behaviors."
    },
    'field-mobilization-asha': {
        name: "Field Mobilization — ASHA",
        description: "Deploy ASHA workers for immediate ground truth and community engagement.",
        riskDrivers: [],
        affectedComponents: { diseaseBurden: -0.5 },
        feasibility: "High", costCategory: "Low", effort: "Immediate",
        responsibleDepartment: "Health Dept.",
        target: "High risk households",
        impactRationale: "Improves early detection.",
        executionSteps: ["Step 1: App alert.", "Step 2: Field route planning.", "Step 3: Door-to-door survey."],
        resourceRequirements: { manpower: "ASHA Workers", vehicles: "None", equipment: "App" },
        specificTimeline: "Day 0", successMetric: "100% household coverage", expectedHealthImpact: "Early detection and containment."
    }
};

export const getAvailableInterventions = () => {
    return Object.entries(INTERVENTION_IMPACT_MAP).map(([id, data]) => ({
        id,
        ...data
    }));
};
