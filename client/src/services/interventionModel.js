/**
 * Advanced Intervention Model - Frontend JavaScript Implementation
 * Based on research-backed formulas for urban climate interventions
 *
 * This is a prototype implementation using simplified models.
 * Not a substitute for full microclimate or hydrologic modeling.
 */

// Editable configuration constants - adjust per city
const CONFIG = {
  years: [0, 5, 10, 15],
  discount_rate: 0.045, // 4.5% - realistic for infrastructure projects in developing countries

  // NDVI <-> LST sensitivity (prototype)
  beta_ndvi_lst: -3.5, // °C per NDVI unit

  // Urban forestry defaults
  canopy_area_per_mature_tree_m2: 50, // m² canopy per mature tree (medium tree)
  maturation_years: 10,
  kgCO2_per_tree_per_year_at_maturity: 21, // kg CO2 / tree / year (more realistic for mature urban trees)
  timber_value_per_tree_after_15yr_usd: 0, // Urban trees are not harvested for timber

  // Green roof defaults
  k_groof_fullcoverage_C: 1.0, // °C cooling for 100% roof greening (neighborhood scale)
  energy_savings_kWh_per_m2_per_year_groof: 15.0, // More realistic energy savings for green roofs

  // Wetland defaults
  k_wet_scale_C: 1.2, // wetland cooling scale for log model
  wetland_porosity: 0.5, // effective storage fraction of depth
  flood_damage_value_per_m3_usd: 2.5, // $ avoided per m3 of peak runoff prevented (more realistic)

  // Solar defaults
  insolation_kwh_m2_year: 1800, // kWh/m²/year (more appropriate for tropical regions like Dhaka)
  performance_ratio: 0.78,
  grid_price_usd_per_kwh: 0.08, // More realistic for Bangladesh
  grid_emission_factor_kgCO2_per_kwh: 0.7, // Bangladesh grid emission factor
  panel_degradation_pct_per_year: 0.006,
  k_albedo_LST_per_albedo_unit: 6.0, // °C per unit albedo change

  // Economic defaults
  social_cost_of_carbon_usd_per_tCO2: 75, // Updated social cost of carbon (2023 estimates)
  energy_saved_per_degC_per_m2_year: 8.5, // More realistic cooling energy savings (kWh per °C per m2-year)

  // Interaction penalty when multiple interventions overlap
  interaction_penalty_base: 0.9, // multiply additive effects by 0.9 when interventions overlap
};

/**
 * Utility: growth factor for maturity (linear ramp)
 */
function maturity_factor(year, maturation_years) {
  return Math.min(1, year / maturation_years); // 0..1
}

/**
 * Validation helper
 */
function validateInputs(baseline, interventions) {
  const warnings = [];
  const errors = [];

  // Validate baseline
  if (
    !baseline ||
    typeof baseline.polygon_area_m2 !== "number" ||
    baseline.polygon_area_m2 <= 0
  ) {
    errors.push("Invalid polygon area");
  }

  // Validate each intervention
  if (interventions.urban_forestry) {
    const trees = interventions.urban_forestry;
    if (trees.number_of_trees <= 0)
      errors.push("Number of trees must be positive");
    if (trees.cost_per_tree_usd < 0)
      errors.push("Cost per tree cannot be negative");

    // Check spatial constraints
    const required_area =
      trees.number_of_trees * trees.planting_density_m2_per_tree;
    if (required_area > baseline.polygon_area_m2) {
      warnings.push(
        `Tree planting requires ${required_area.toLocaleString()}m² but polygon is only ${baseline.polygon_area_m2.toLocaleString()}m². Consider reducing trees or density.`
      );
    }
  }

  if (interventions.green_roofs) {
    const groof = interventions.green_roofs;
    if (groof.coverage_area_m2 > groof.roof_area_available_m2) {
      warnings.push("Green roof coverage capped to available roof area");
      groof.coverage_area_m2 = Math.min(
        groof.coverage_area_m2,
        groof.roof_area_available_m2
      );
    }
    if (groof.coverage_area_m2 > baseline.polygon_area_m2) {
      warnings.push("Green roof coverage capped to polygon area");
      groof.coverage_area_m2 = Math.min(
        groof.coverage_area_m2,
        baseline.polygon_area_m2
      );
    }
  }

  if (interventions.urban_wetlands) {
    const wetland = interventions.urban_wetlands;
    if (wetland.wetland_area_m2 > baseline.polygon_area_m2) {
      warnings.push("Wetland area capped to polygon area");
      wetland.wetland_area_m2 = Math.min(
        wetland.wetland_area_m2,
        baseline.polygon_area_m2
      );
    }
  }

  if (interventions.rooftop_solar) {
    const solar = interventions.rooftop_solar;
    const total_area =
      solar.solar_panel_area_m2 + solar.reflective_coating_area_m2;
    if (total_area > baseline.polygon_area_m2) {
      warnings.push("Solar + reflective coating area capped to polygon area");
      const scale = baseline.polygon_area_m2 / total_area;
      solar.solar_panel_area_m2 *= scale;
      solar.reflective_coating_area_m2 *= scale;
    }
  }

  return { warnings, errors };
}

/**
 * Model Urban Forestry impacts
 */
function modelTrees(baseline, params, year, config = CONFIG) {
  const { number_of_trees, cost_per_tree_usd, planting_density_m2_per_tree } =
    params;

  // Growth over time
  const maturity = maturity_factor(year, config.maturation_years);
  const canopy_total_m2 =
    number_of_trees * config.canopy_area_per_mature_tree_m2 * maturity;
  const canopy_fraction = Math.min(
    1.0,
    canopy_total_m2 / baseline.polygon_area_m2
  );

  // NDVI change: assume full canopy fraction => +0.6 NDVI (prototype)
  const delta_NDVI_tree = canopy_fraction * 0.6;

  // LST change via NDVI->LST relationship
  const delta_LST_tree = config.beta_ndvi_lst * delta_NDVI_tree;

  // CO2 sequestration
  const kgCO2_year =
    number_of_trees * config.kgCO2_per_tree_per_year_at_maturity * maturity;
  const tCO2_year = kgCO2_year / 1000;

  // Monetary impacts
  const capital_cost = year === 0 ? number_of_trees * cost_per_tree_usd : 0;
  const annual_OandM = number_of_trees * (cost_per_tree_usd * 0.02); // 2% of capex annually (more realistic)

  // No timber value for urban trees - they provide ecosystem services instead
  const timber_revenue = 0;

  // Carbon sequestration value (realistic: ~$1.88 per mature tree annually)
  const carbon_value = tCO2_year * config.social_cost_of_carbon_usd_per_tCO2;

  // ULTRA-CONSERVATIVE Energy savings (heavily discounted for measurement uncertainty)
  const energy_savings_per_tree = 0.08; // USD per tree per year (minimal measurable impact)
  const heat_energy_savings =
    number_of_trees * maturity * energy_savings_per_tree;

  // ULTRA-CONSERVATIVE Air quality benefits (heavily discounted for abstract nature)
  const air_quality_per_tree = 0.04; // USD per tree per year (minimal abstract benefit)
  const air_quality_benefits =
    number_of_trees * maturity * air_quality_per_tree;

  // CONSERVATIVE Stormwater management benefits (reduced but measurable)
  const stormwater_per_tree = 0.17; // USD per tree per year (conservative measurable benefit)
  const stormwater_benefits = number_of_trees * maturity * stormwater_per_tree;

  // ULTRA-CONSERVATIVE Property value increase (minimal speculative benefit)
  const property_value_per_tree = 0.12; // USD per tree per year (minimal speculative benefit)
  const property_value_benefit =
    number_of_trees * maturity * property_value_per_tree;

  return {
    delta_NDVI: delta_NDVI_tree,
    delta_LST: delta_LST_tree,
    runoff_reduction_frac: canopy_fraction * 0.1, // Trees do provide some runoff reduction
    tCO2_year: tCO2_year,
    capital_cost: capital_cost,
    annual_benefits:
      carbon_value +
      heat_energy_savings +
      air_quality_benefits +
      stormwater_benefits +
      property_value_benefit,
    annual_costs: annual_OandM,
    confidence: "medium", // NDVI->LST conversion needs local calibration
  };
}

/**
 * Model Green Roofs impacts
 */
function modelGreenRoof(baseline, params, year, config = CONFIG) {
  const { coverage_area_m2, cost_per_m2_usd, roof_area_available_m2 } = params;

  // Cap coverage to available roof area
  const actual_coverage = Math.min(coverage_area_m2, roof_area_available_m2);
  const roof_frac = actual_coverage / roof_area_available_m2;

  // NDVI change (prototype)
  const delta_NDVI_groof = (actual_coverage / baseline.polygon_area_m2) * 0.02;

  // LST change
  const delta_LST_groof = -config.k_groof_fullcoverage_C * roof_frac;

  // Energy savings
  const energy_saved_kwh_year =
    actual_coverage * config.energy_savings_kWh_per_m2_per_year_groof;
  const value_energy_saved_usd =
    energy_saved_kwh_year * config.grid_price_usd_per_kwh;

  // Costs
  const capital_cost = year === 0 ? actual_coverage * cost_per_m2_usd : 0;
  const annual_OandM = actual_coverage * (cost_per_m2_usd * 0.05);

  return {
    delta_NDVI: delta_NDVI_groof,
    delta_LST: delta_LST_groof,
    runoff_reduction_frac: 0.1 * (actual_coverage / baseline.polygon_area_m2), // Minor runoff benefit
    tCO2_year: 0, // Minimal carbon sequestration for green roofs
    capital_cost: capital_cost,
    annual_benefits: value_energy_saved_usd,
    annual_costs: annual_OandM,
    confidence: "medium",
  };
}

/**
 * Model Urban Wetlands impacts
 */
function modelWetland(baseline, params, year, config = CONFIG) {
  const { wetland_area_m2, average_water_depth_m, cost_per_m2_usd } = params;

  const wetland_ha = wetland_area_m2 / 10000;
  const storage_m3 =
    wetland_area_m2 * average_water_depth_m * config.wetland_porosity;

  // Runoff reduction (prototype): linear up to 60%
  const runoff_reduction_frac = Math.min(
    0.6,
    (wetland_area_m2 / baseline.polygon_area_m2) * 0.5
  );

  // LST change using log model
  const delta_LST_wet = -config.k_wet_scale_C * Math.log10(1 + wetland_ha);

  // NDVI change (wetlands have some vegetation)
  const delta_NDVI_wet = (wetland_area_m2 / baseline.polygon_area_m2) * 0.15;

  // Monetary benefits: avoided flood damage
  const annual_avoided_flood_damage_usd =
    storage_m3 * config.flood_damage_value_per_m3_usd * runoff_reduction_frac;

  // Costs
  const capital_cost = year === 0 ? wetland_area_m2 * cost_per_m2_usd : 0;
  const annual_OandM = wetland_area_m2 * (cost_per_m2_usd * 0.01);

  return {
    delta_NDVI: delta_NDVI_wet,
    delta_LST: delta_LST_wet,
    runoff_reduction_frac: runoff_reduction_frac,
    tCO2_year: 0, // Wetlands have complex carbon dynamics, simplified to 0
    capital_cost: capital_cost,
    annual_benefits: annual_avoided_flood_damage_usd,
    annual_costs: annual_OandM,
    confidence: "medium-low", // Runoff/flood estimations are approximate
  };
}

/**
 * Model Rooftop Solar + Reflective Coating impacts
 */
function modelSolarReflective(baseline, params, year, config = CONFIG) {
  const {
    solar_panel_area_m2,
    panel_efficiency_pct,
    reflective_coating_area_m2,
    solar_cost_per_m2_usd,
    reflective_cost_per_m2_usd,
  } = params;

  // Energy generation (with degradation over time)
  const kWh_year_initial =
    solar_panel_area_m2 *
    config.insolation_kwh_m2_year *
    (panel_efficiency_pct / 100) *
    config.performance_ratio;
  const kWh_year_y =
    kWh_year_initial *
    Math.pow(1 - config.panel_degradation_pct_per_year, year);
  const value_energy_saved_usd = kWh_year_y * config.grid_price_usd_per_kwh;

  // CO2 avoided
  const kgCO2_avoided = kWh_year_y * config.grid_emission_factor_kgCO2_per_kwh;
  const tCO2_year = kgCO2_avoided / 1000;

  // LST impacts
  // Reflective coating -> albedo increase
  const albedo_delta = 0.2; // Default albedo increase
  const reflective_frac = reflective_coating_area_m2 / baseline.polygon_area_m2;
  const delta_LST_reflective =
    -config.k_albedo_LST_per_albedo_unit * albedo_delta * reflective_frac;

  // PV shading effect (local roof cooling)
  const pv_roof_frac = solar_panel_area_m2 / baseline.polygon_area_m2;
  const delta_LST_pv_shade = -1.0 * pv_roof_frac; // -1°C per full-coverage equivalent

  // Net LST change
  const delta_LST_solar_reflect = delta_LST_reflective + delta_LST_pv_shade;

  // Costs
  const capital_cost =
    year === 0
      ? solar_panel_area_m2 * solar_cost_per_m2_usd +
        reflective_coating_area_m2 * reflective_cost_per_m2_usd
      : 0;
  const avg_cost_per_m2 =
    (solar_cost_per_m2_usd + reflective_cost_per_m2_usd) / 2;
  const annual_OandM =
    (solar_panel_area_m2 + reflective_coating_area_m2) *
    (avg_cost_per_m2 * 0.01);

  return {
    delta_NDVI: 0, // Solar panels don't significantly affect NDVI
    delta_LST: delta_LST_solar_reflect,
    runoff_reduction_frac: 0, // No runoff impact
    tCO2_year: tCO2_year,
    capital_cost: capital_cost,
    annual_benefits: value_energy_saved_usd,
    annual_costs: annual_OandM,
    confidence: "medium", // Energy generation ROI is realistic if insolation is accurate
  };
}

/**
 * Compute ROI metrics with CORRECT financial formulas
 */
function computeROI(projections, config = CONFIG) {
  let cumulative_undiscounted_cashflow = 0;
  let cumulative_npv = 0;
  let payback_year = null;

  const total_capital_cost = projections.reduce(
    (sum, p) => sum + p.capital_cost_total,
    0
  );

  // Get operational years (exclude year 0)
  const operationalProjections = projections.filter((p) => p.year > 0);

  // Calculate average annual net benefit
  const totalNetBenefits = operationalProjections.reduce(
    (sum, p) => sum + (p.annual_benefits_usd - p.annual_costs_usd),
    0
  );
  const averageAnnualNetBenefit =
    operationalProjections.length > 0
      ? totalNetBenefits / operationalProjections.length
      : 0;

  // Calculate NPV and payback properly
  projections.forEach((projection, index) => {
    if (index === 0) {
      // Year 0: Initial investment (negative cash flow)
      projection.NPV_usd_cumulative = -projection.capital_cost_total;
      cumulative_npv = projection.NPV_usd_cumulative;
      cumulative_undiscounted_cashflow = -projection.capital_cost_total;
      return;
    }

    const year = projection.year;
    const net_cashflow =
      projection.annual_benefits_usd -
      projection.annual_costs_usd -
      projection.capital_cost_total;

    // Proper NPV calculation: discount each year's net cash flow
    const discounted_cashflow =
      net_cashflow / Math.pow(1 + config.discount_rate, year);
    cumulative_npv += discounted_cashflow;
    projection.NPV_usd_cumulative = cumulative_npv;

    // Simple payback calculation (undiscounted)
    cumulative_undiscounted_cashflow += net_cashflow;

    // Payback occurs when cumulative undiscounted cash flow becomes positive
    if (payback_year === null && cumulative_undiscounted_cashflow >= 0) {
      // Interpolate for more accurate payback period
      const prev_cashflow = cumulative_undiscounted_cashflow - net_cashflow;
      const fraction =
        prev_cashflow !== 0 ? Math.abs(prev_cashflow) / net_cashflow : 0;
      payback_year = year - 1 + fraction;
    }

    // Store the net cash flow for reference
    projection.net_cashflow_usd = net_cashflow;
    projection.discounted_cashflow_usd = discounted_cashflow;
  });

  // Calculate CORRECT ROI = Average Annual Net Benefit / Initial Investment * 100
  const roi_percentage =
    total_capital_cost > 0
      ? Math.max(
          -100,
          Math.min(50, (averageAnnualNetBenefit / total_capital_cost) * 100)
        )
      : 0;

  // Calculate IRR (Internal Rate of Return) approximation
  const irr = calculateIRR(projections);

  return {
    payback_year: payback_year ? Math.round(payback_year * 10) / 10 : null,
    total_capital_cost,
    final_npv: cumulative_npv,
    roi_percentage,
    average_annual_net_benefit: averageAnnualNetBenefit,
    irr: irr,
  };
}

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 */
function calculateIRR(projections, maxIterations = 100, tolerance = 0.0001) {
  // Extract cash flows
  const cashFlows = projections.map((p) => {
    if (p.year === 0) return -p.capital_cost_total;
    return p.annual_benefits_usd - p.annual_costs_usd - p.capital_cost_total;
  });

  // Initial guess for IRR
  let rate = 0.1; // 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // derivative of NPV

    for (let j = 0; j < cashFlows.length; j++) {
      const year = projections[j].year;
      const cashFlow = cashFlows[j];

      npv += cashFlow / Math.pow(1 + rate, year);
      dnpv -= (year * cashFlow) / Math.pow(1 + rate, year + 1);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return Math.round(newRate * 1000) / 10; // Return as percentage with 1 decimal
    }

    rate = newRate;
  }

  return null; // IRR not found
}

/**
 * Main computation function
 */
function computeProjections(baseline, interventions, customConfig = {}) {
  const config = { ...CONFIG, ...customConfig };
  const validation = validateInputs(baseline, interventions);

  if (validation.errors.length > 0) {
    throw new Error(`Validation errors: ${validation.errors.join(", ")}`);
  }

  const projections = [];

  // Process each year
  config.years.forEach((year) => {
    const yearProjection = {
      year: year,
      LST_mean: baseline.LST_mean,
      NDVI_mean: baseline.NDVI_mean,
      runoff_index: 1.0, // Baseline runoff index
      tCO2_sequestered: 0,
      annual_benefits_usd: 0,
      annual_costs_usd: 0,
      capital_cost_total: 0,
      cashflow_usd: 0,
      NPV_usd_cumulative: 0,
      confidence: "high",
      warnings: [...validation.warnings],
    };

    let total_delta_LST = 0;
    let total_delta_NDVI = 0;
    let total_runoff_reduction = 0;
    let overlap_detected = false;

    // Process each intervention type
    if (interventions.urban_forestry) {
      const result = modelTrees(
        baseline,
        interventions.urban_forestry,
        year,
        config
      );
      total_delta_LST += result.delta_LST;
      total_delta_NDVI += result.delta_NDVI;
      total_runoff_reduction += result.runoff_reduction_frac;
      yearProjection.tCO2_sequestered += result.tCO2_year;
      yearProjection.annual_benefits_usd += result.annual_benefits;
      yearProjection.annual_costs_usd += result.annual_costs;
      yearProjection.capital_cost_total += result.capital_cost;
      if (result.confidence === "low") yearProjection.confidence = "low";
      else if (
        result.confidence === "medium" &&
        yearProjection.confidence === "high"
      )
        yearProjection.confidence = "medium";
    }

    if (interventions.green_roofs) {
      const result = modelGreenRoof(
        baseline,
        interventions.green_roofs,
        year,
        config
      );
      total_delta_LST += result.delta_LST;
      total_delta_NDVI += result.delta_NDVI;
      total_runoff_reduction += result.runoff_reduction_frac;
      yearProjection.tCO2_sequestered += result.tCO2_year;
      yearProjection.annual_benefits_usd += result.annual_benefits;
      yearProjection.annual_costs_usd += result.annual_costs;
      yearProjection.capital_cost_total += result.capital_cost;
      overlap_detected = interventions.urban_forestry; // Trees and green roofs can overlap
      if (result.confidence === "low") yearProjection.confidence = "low";
      else if (
        result.confidence === "medium" &&
        yearProjection.confidence === "high"
      )
        yearProjection.confidence = "medium";
    }

    if (interventions.urban_wetlands) {
      const result = modelWetland(
        baseline,
        interventions.urban_wetlands,
        year,
        config
      );
      total_delta_LST += result.delta_LST;
      total_delta_NDVI += result.delta_NDVI;
      total_runoff_reduction += result.runoff_reduction_frac;
      yearProjection.tCO2_sequestered += result.tCO2_year;
      yearProjection.annual_benefits_usd += result.annual_benefits;
      yearProjection.annual_costs_usd += result.annual_costs;
      yearProjection.capital_cost_total += result.capital_cost;
      if (result.confidence === "medium-low") yearProjection.confidence = "low";
    }

    if (interventions.rooftop_solar) {
      const result = modelSolarReflective(
        baseline,
        interventions.rooftop_solar,
        year,
        config
      );
      total_delta_LST += result.delta_LST;
      total_delta_NDVI += result.delta_NDVI;
      total_runoff_reduction += result.runoff_reduction_frac;
      yearProjection.tCO2_sequestered += result.tCO2_year;
      yearProjection.annual_benefits_usd += result.annual_benefits;
      yearProjection.annual_costs_usd += result.annual_costs;
      yearProjection.capital_cost_total += result.capital_cost;
      if (result.confidence === "low") yearProjection.confidence = "low";
      else if (
        result.confidence === "medium" &&
        yearProjection.confidence === "high"
      )
        yearProjection.confidence = "medium";
    }

    // Apply interaction penalty if interventions overlap
    if (overlap_detected) {
      total_delta_LST *= config.interaction_penalty_base;
      total_delta_NDVI *= config.interaction_penalty_base;
      yearProjection.warnings.push(
        "Interaction penalty applied due to overlapping interventions"
      );
    }

    // Update final values
    yearProjection.LST_mean = baseline.LST_mean + total_delta_LST;
    yearProjection.NDVI_mean = baseline.NDVI_mean + total_delta_NDVI;
    yearProjection.runoff_index = Math.max(0, 1.0 - total_runoff_reduction);
    yearProjection.cashflow_usd =
      yearProjection.annual_benefits_usd -
      yearProjection.annual_costs_usd -
      yearProjection.capital_cost_total;

    projections.push(yearProjection);
  });

  // Calculate ROI metrics
  const roiResults = computeROI(projections, config);

  // Create summary
  const summary = {
    horizon_years: Math.max(...config.years),
    delta_LST_5yr:
      projections.find((p) => p.year === 5)?.LST_mean - baseline.LST_mean || 0,
    delta_LST_10yr:
      projections.find((p) => p.year === 10)?.LST_mean - baseline.LST_mean || 0,
    delta_NDVI_10yr:
      projections.find((p) => p.year === 10)?.NDVI_mean - baseline.NDVI_mean ||
      0,
    payback_year: roiResults.payback_year,
    total_capital_cost_usd: roiResults.total_capital_cost,
    notes: [
      "Prototype estimate — not a substitute for full microclimate or hydrologic modelling.",
      "Confidence levels: high (well-established), medium (needs local calibration), low (simplified proxies).",
    ],
  };

  return {
    polygon_id: baseline.polygon_id || "default",
    polygon_area_m2: baseline.polygon_area_m2,
    baseline: {
      year: baseline.baseline_year || 2025,
      LST_mean: baseline.LST_mean,
      NDVI_mean: baseline.NDVI_mean,
      precip_mm_yr: baseline.precip_mm_yr,
      elevation_mean: baseline.elevation_mean,
      impervious_fraction: baseline.impervious_fraction,
    },
    interventions: interventions,
    projections: projections,
    summary: summary,
  };
}

// Export the module
export {
  computeProjections,
  modelTrees,
  modelGreenRoof,
  modelWetland,
  modelSolarReflective,
  computeROI,
  CONFIG,
};

export default {
  computeProjections,
  modelTrees,
  modelGreenRoof,
  modelWetland,
  modelSolarReflective,
  computeROI,
  CONFIG,
};
