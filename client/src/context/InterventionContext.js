import React, { createContext, useContext, useReducer, useEffect } from 'react';

const InterventionContext = createContext();

// Intervention types and their properties
const INTERVENTION_TYPES = {
  TREE_PLANTING: {
    id: 'tree_planting',
    name: 'Urban Tree Planting',
    icon: '🌳',
    description: 'Plant trees to reduce urban heat island effect and improve air quality',
    baseCost: 150, // per tree
    benefits: {
      temperature: -2.5, // °C reduction
      air_quality: 15, // AQI improvement
      flood_mitigation: 0.3, // flood capacity improvement
      biodiversity: 0.2, // biodiversity index improvement
    },
    requirements: {
      space: 25, // m² per tree
      maintenance: 50, // annual cost per tree
    },
  },
  COOL_ROOFS: {
    id: 'cool_roofs',
    name: 'Cool Roof Installation',
    icon: '🏢',
    description: 'Install reflective roofing materials to reduce building temperatures',
    baseCost: 25, // per m²
    benefits: {
      temperature: -1.8,
      energy_savings: 0.3, // energy reduction factor
      air_quality: 5,
    },
    requirements: {
      area: 'roof_space', // requires roof area data
      maintenance: 2, // annual cost per m²
    },
  },
  WETLANDS: {
    id: 'wetlands',
    name: 'Urban Wetlands',
    icon: '🏞️',
    description: 'Create wetland areas for flood control and biodiversity',
    baseCost: 500, // per m²
    benefits: {
      flood_mitigation: 0.8,
      biodiversity: 0.6,
      air_quality: 8,
      temperature: -1.2,
    },
    requirements: {
      space: 1000, // minimum m²
      maintenance: 15, // annual cost per m²
    },
  },
  GREEN_CORRIDORS: {
    id: 'green_corridors',
    name: 'Green Corridors',
    icon: '🛤️',
    description: 'Connect green spaces with vegetated pathways',
    baseCost: 300, // per linear meter
    benefits: {
      air_quality: 12,
      biodiversity: 0.4,
      temperature: -1.5,
      walkability: 0.3,
    },
    requirements: {
      length: 500, // minimum length in meters
      width: 10, // minimum width in meters
      maintenance: 25, // annual cost per linear meter
    },
  },
  GREEN_WALLS: {
    id: 'green_walls',
    name: 'Vertical Green Walls',
    icon: '🧱',
    description: 'Install living walls on buildings for air purification',
    baseCost: 400, // per m²
    benefits: {
      air_quality: 20,
      temperature: -1.0,
      energy_savings: 0.15,
      aesthetics: 0.4,
    },
    requirements: {
      area: 'wall_space',
      maintenance: 35, // annual cost per m²
    },
  },
  PERMEABLE_SURFACES: {
    id: 'permeable_surfaces',
    name: 'Permeable Pavements',
    icon: '🪨',
    description: 'Replace impermeable surfaces with permeable alternatives',
    baseCost: 80, // per m²
    benefits: {
      flood_mitigation: 0.6,
      temperature: -0.8,
      groundwater_recharge: 0.5,
    },
    requirements: {
      area: 'paved_area',
      maintenance: 5, // annual cost per m²
    },
  },
};

// Initial state
const initialState = {
  selectedInterventions: [],
  budget: 1000000, // $1M default budget
  timeline: 5, // 5 years
  priorities: {
    heat_reduction: 0.3,
    flood_mitigation: 0.3,
    air_quality: 0.25,
    biodiversity: 0.15,
  },
  scenarios: [],
  activeScenario: null,
  optimizationResults: null,
  costBenefitAnalysis: null,
  loading: false,
  error: null,
};

// Action types
const ACTION_TYPES = {
  ADD_INTERVENTION: 'ADD_INTERVENTION',
  REMOVE_INTERVENTION: 'REMOVE_INTERVENTION',
  UPDATE_INTERVENTION: 'UPDATE_INTERVENTION',
  SET_BUDGET: 'SET_BUDGET',
  SET_TIMELINE: 'SET_TIMELINE',
  SET_PRIORITIES: 'SET_PRIORITIES',
  ADD_SCENARIO: 'ADD_SCENARIO',
  REMOVE_SCENARIO: 'REMOVE_SCENARIO',
  SET_ACTIVE_SCENARIO: 'SET_ACTIVE_SCENARIO',
  SET_OPTIMIZATION_RESULTS: 'SET_OPTIMIZATION_RESULTS',
  SET_COST_BENEFIT_ANALYSIS: 'SET_COST_BENEFIT_ANALYSIS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_INTERVENTIONS: 'RESET_INTERVENTIONS',
};

// Reducer function
function interventionReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_INTERVENTION:
      return {
        ...state,
        selectedInterventions: [...state.selectedInterventions, action.payload],
      };

    case ACTION_TYPES.REMOVE_INTERVENTION:
      return {
        ...state,
        selectedInterventions: state.selectedInterventions.filter(
          (intervention) => intervention.id !== action.payload
        ),
      };

    case ACTION_TYPES.UPDATE_INTERVENTION:
      return {
        ...state,
        selectedInterventions: state.selectedInterventions.map((intervention) =>
          intervention.id === action.payload.id
            ? { ...intervention, ...action.payload.updates }
            : intervention
        ),
      };

    case ACTION_TYPES.SET_BUDGET:
      return {
        ...state,
        budget: action.payload,
      };

    case ACTION_TYPES.SET_TIMELINE:
      return {
        ...state,
        timeline: action.payload,
      };

    case ACTION_TYPES.SET_PRIORITIES:
      return {
        ...state,
        priorities: { ...state.priorities, ...action.payload },
      };

    case ACTION_TYPES.ADD_SCENARIO:
      return {
        ...state,
        scenarios: [...state.scenarios, action.payload],
      };

    case ACTION_TYPES.REMOVE_SCENARIO:
      return {
        ...state,
        scenarios: state.scenarios.filter((scenario) => scenario.id !== action.payload),
        activeScenario: state.activeScenario === action.payload ? null : state.activeScenario,
      };

    case ACTION_TYPES.SET_ACTIVE_SCENARIO:
      return {
        ...state,
        activeScenario: action.payload,
      };

    case ACTION_TYPES.SET_OPTIMIZATION_RESULTS:
      return {
        ...state,
        optimizationResults: action.payload,
      };

    case ACTION_TYPES.SET_COST_BENEFIT_ANALYSIS:
      return {
        ...state,
        costBenefitAnalysis: action.payload,
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ACTION_TYPES.RESET_INTERVENTIONS:
      return {
        ...state,
        selectedInterventions: [],
        activeScenario: null,
        optimizationResults: null,
        costBenefitAnalysis: null,
      };

    default:
      return state;
  }
}

// Intervention Provider Component
export function InterventionProvider({ children }) {
  const [state, dispatch] = useReducer(interventionReducer, initialState);

  // Actions
  const actions = {
    // Add intervention to the current plan
    addIntervention: (interventionType, parameters = {}) => {
      const baseIntervention = INTERVENTION_TYPES[interventionType.toUpperCase()];
      if (!baseIntervention) {
        console.error('Invalid intervention type:', interventionType);
        return;
      }

      const intervention = {
        id: `${baseIntervention.id}_${Date.now()}`,
        type: baseIntervention.id,
        name: baseIntervention.name,
        icon: baseIntervention.icon,
        description: baseIntervention.description,
        quantity: parameters.quantity || 1,
        location: parameters.location || null,
        cost: calculateInterventionCost(baseIntervention, parameters),
        benefits: calculateInterventionBenefits(baseIntervention, parameters),
        timeline: parameters.timeline || 1, // years to implement
        priority: parameters.priority || 'medium',
        status: 'planned',
        ...parameters,
      };

      dispatch({ type: ACTION_TYPES.ADD_INTERVENTION, payload: intervention });
    },

    // Remove intervention
    removeIntervention: (interventionId) => {
      dispatch({ type: ACTION_TYPES.REMOVE_INTERVENTION, payload: interventionId });
    },

    // Update intervention parameters
    updateIntervention: (interventionId, updates) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_INTERVENTION,
        payload: { id: interventionId, updates },
      });
    },

    // Set budget constraint
    setBudget: (budget) => {
      dispatch({ type: ACTION_TYPES.SET_BUDGET, payload: budget });
    },

    // Set timeline
    setTimeline: (timeline) => {
      dispatch({ type: ACTION_TYPES.SET_TIMELINE, payload: timeline });
    },

    // Set priorities
    setPriorities: (priorities) => {
      dispatch({ type: ACTION_TYPES.SET_PRIORITIES, payload: priorities });
    },

    // Save current intervention plan as scenario
    saveScenario: (name, description = '') => {
      const scenario = {
        id: `scenario_${Date.now()}`,
        name,
        description,
        interventions: [...state.selectedInterventions],
        budget: state.budget,
        timeline: state.timeline,
        priorities: { ...state.priorities },
        createdAt: new Date().toISOString(),
        results: state.optimizationResults,
      };

      dispatch({ type: ACTION_TYPES.ADD_SCENARIO, payload: scenario });
      return scenario.id;
    },

    // Load scenario
    loadScenario: (scenarioId) => {
      const scenario = state.scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return;

      // Reset current state and load scenario data
      dispatch({ type: ACTION_TYPES.RESET_INTERVENTIONS });
      
      scenario.interventions.forEach((intervention) => {
        dispatch({ type: ACTION_TYPES.ADD_INTERVENTION, payload: intervention });
      });

      dispatch({ type: ACTION_TYPES.SET_BUDGET, payload: scenario.budget });
      dispatch({ type: ACTION_TYPES.SET_TIMELINE, payload: scenario.timeline });
      dispatch({ type: ACTION_TYPES.SET_PRIORITIES, payload: scenario.priorities });
      dispatch({ type: ACTION_TYPES.SET_ACTIVE_SCENARIO, payload: scenarioId });
    },

    // Remove scenario
    removeScenario: (scenarioId) => {
      dispatch({ type: ACTION_TYPES.REMOVE_SCENARIO, payload: scenarioId });
    },

    // Optimize intervention plan based on constraints and priorities
    optimizeInterventions: async (cityData) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

        // Perform budget-constrained optimization
        const optimizationResults = await performOptimization(
          state.selectedInterventions,
          state.budget,
          state.timeline,
          state.priorities,
          cityData
        );

        dispatch({
          type: ACTION_TYPES.SET_OPTIMIZATION_RESULTS,
          payload: optimizationResults,
        });

        return optimizationResults;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    // Calculate cost-benefit analysis
    calculateCostBenefit: async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

        const analysis = calculateCostBenefitAnalysis(
          state.selectedInterventions,
          state.budget,
          state.timeline,
          state.priorities
        );

        dispatch({
          type: ACTION_TYPES.SET_COST_BENEFIT_ANALYSIS,
          payload: analysis,
        });

        return analysis;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    // Reset all interventions
    resetInterventions: () => {
      dispatch({ type: ACTION_TYPES.RESET_INTERVENTIONS });
    },

    // Get available intervention types
    getInterventionTypes: () => INTERVENTION_TYPES,

    // Get intervention by type
    getInterventionType: (type) => INTERVENTION_TYPES[type.toUpperCase()],
  };

  const value = {
    ...state,
    ...actions,
    interventionTypes: INTERVENTION_TYPES,
    totalCost: calculateTotalCost(state.selectedInterventions),
    projectedBenefits: calculateTotalBenefits(state.selectedInterventions),
    budgetUtilization: calculateTotalCost(state.selectedInterventions) / state.budget,
  };

  return (
    <InterventionContext.Provider value={value}>
      {children}
    </InterventionContext.Provider>
  );
}

// Custom hook to use intervention context
export const useInterventions = () => {
  const context = useContext(InterventionContext);
  if (!context) {
    throw new Error('useInterventions must be used within an InterventionProvider');
  }
  return context;
};

// Helper functions
function calculateInterventionCost(baseIntervention, parameters) {
  const quantity = parameters.quantity || 1;
  const baseCost = baseIntervention.baseCost * quantity;
  const maintenanceCost = baseIntervention.requirements.maintenance * quantity * (parameters.timeline || 1);
  return baseCost + maintenanceCost;
}

function calculateInterventionBenefits(baseIntervention, parameters) {
  const quantity = parameters.quantity || 1;
  const benefits = {};
  
  for (const [benefit, value] of Object.entries(baseIntervention.benefits)) {
    benefits[benefit] = value * quantity;
  }
  
  return benefits;
}

function calculateTotalCost(interventions) {
  return interventions.reduce((total, intervention) => total + intervention.cost, 0);
}

function calculateTotalBenefits(interventions) {
  const totalBenefits = {};
  
  interventions.forEach((intervention) => {
    for (const [benefit, value] of Object.entries(intervention.benefits)) {
      totalBenefits[benefit] = (totalBenefits[benefit] || 0) + value;
    }
  });
  
  return totalBenefits;
}

// Optimization algorithm (simplified)
async function performOptimization(interventions, budget, timeline, priorities, cityData) {
  // This is a simplified optimization algorithm
  // In a real application, this would use more sophisticated algorithms
  
  const optimizedPlan = {
    interventions: [...interventions],
    totalCost: calculateTotalCost(interventions),
    projectedBenefits: calculateTotalBenefits(interventions),
    efficiency: 0,
    recommendations: [],
    phasing: [],
  };

  // Calculate efficiency score
  const benefits = optimizedPlan.projectedBenefits;
  const weightedBenefitScore = 
    (benefits.temperature || 0) * priorities.heat_reduction +
    (benefits.flood_mitigation || 0) * priorities.flood_mitigation +
    (benefits.air_quality || 0) * priorities.air_quality +
    (benefits.biodiversity || 0) * priorities.biodiversity;
  
  optimizedPlan.efficiency = weightedBenefitScore / optimizedPlan.totalCost;

  // Generate recommendations
  if (optimizedPlan.totalCost > budget) {
    optimizedPlan.recommendations.push({
      type: 'budget_constraint',
      message: `Current plan exceeds budget by $${(optimizedPlan.totalCost - budget).toLocaleString()}`,
      priority: 'high',
    });
  }

  // Generate implementation phasing
  optimizedPlan.phasing = generateImplementationPhasing(interventions, timeline);

  return optimizedPlan;
}

function generateImplementationPhasing(interventions, timeline) {
  const phases = [];
  const yearsPerPhase = timeline / Math.min(timeline, 3); // Max 3 phases
  
  for (let i = 0; i < timeline; i += yearsPerPhase) {
    phases.push({
      phase: phases.length + 1,
      startYear: Math.floor(i) + 1,
      endYear: Math.min(Math.floor(i + yearsPerPhase), timeline),
      interventions: [], // Would be populated based on priority and dependencies
      cost: 0,
    });
  }
  
  return phases;
}

function calculateCostBenefitAnalysis(interventions, budget, timeline, priorities) {
  const totalCost = calculateTotalCost(interventions);
  const totalBenefits = calculateTotalBenefits(interventions);
  
  // Simplified monetary benefit calculation
  const monetaryBenefits = {
    energy_savings: (totalBenefits.energy_savings || 0) * 50000, // $50k per unit
    flood_damage_prevention: (totalBenefits.flood_mitigation || 0) * 100000,
    health_cost_savings: (totalBenefits.air_quality || 0) * 5000,
    property_value_increase: (totalBenefits.temperature || 0) * 20000,
  };
  
  const totalMonetaryBenefits = Object.values(monetaryBenefits).reduce((sum, value) => sum + value, 0);
  
  return {
    totalCost,
    totalBenefits: totalMonetaryBenefits,
    benefitCostRatio: totalMonetaryBenefits / totalCost,
    netPresentValue: totalMonetaryBenefits - totalCost,
    paybackPeriod: totalCost / (totalMonetaryBenefits / timeline),
    breakdownBenefits: monetaryBenefits,
    environmentalBenefits: totalBenefits,
    timeline,
    riskFactors: [
      {
        factor: 'Implementation Risk',
        probability: 0.2,
        impact: totalCost * 0.1,
      },
      {
        factor: 'Climate Variability',
        probability: 0.3,
        impact: totalMonetaryBenefits * 0.15,
      },
    ],
  };
}
