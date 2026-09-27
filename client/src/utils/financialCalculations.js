/**
 * CORRECT Financial Calculations for NASA Healthy Cities Project
 *
 * This file contains PROPER financial formulas for ROI, NPV, and payback calculations.
 * All other files should use these functions to ensure consistency and correctness.
 */

/**
 * Financial Configuration
 */
export const FINANCIAL_CONFIG = {
  DISCOUNT_RATE: 0.045, // 4.5% - appropriate for infrastructure in developing countries
  MAX_ROI_PERCENT: 50, // Cap ROI at reasonable maximum
  MIN_ROI_PERCENT: -100, // Total loss maximum
  SOCIAL_COST_CARBON: 75, // USD per ton CO2
  DEFAULT_PROJECT_LIFE: 20, // years
};

/**
 * Calculate Net Present Value (NPV) correctly
 * @param {number} initialInvestment - Upfront capital cost
 * @param {Array} annualCashFlows - Array of net annual cash flows [year1, year2, ...]
 * @param {number} discountRate - Annual discount rate (default 4.5%)
 * @returns {number} Net Present Value in USD
 */
export function calculateNPV(
  initialInvestment,
  annualCashFlows,
  discountRate = FINANCIAL_CONFIG.DISCOUNT_RATE
) {
  if (!initialInvestment || !annualCashFlows || annualCashFlows.length === 0) {
    return -initialInvestment || 0;
  }

  let npv = -initialInvestment; // Start with negative initial investment

  annualCashFlows.forEach((cashFlow, index) => {
    const year = index + 1;
    const discountedCashFlow = cashFlow / Math.pow(1 + discountRate, year);
    npv += discountedCashFlow;
  });

  return npv;
}

/**
 * Calculate Return on Investment (ROI) correctly
 * ROI = (Average Annual Net Benefit / Initial Investment) * 100
 * @param {number} initialInvestment - Upfront capital cost
 * @param {Array} annualCashFlows - Array of net annual cash flows
 * @returns {number} ROI as percentage (bounded between -100% and 50%)
 */
export function calculateROI(initialInvestment, annualCashFlows) {
  if (
    !initialInvestment ||
    initialInvestment <= 0 ||
    !annualCashFlows ||
    annualCashFlows.length === 0
  ) {
    return 0;
  }

  // Calculate average annual net benefit
  const totalNetBenefit = annualCashFlows.reduce(
    (sum, cashFlow) => sum + cashFlow,
    0
  );
  const averageAnnualBenefit = totalNetBenefit / annualCashFlows.length;

  // ROI = Annual Return / Initial Investment
  const roi = (averageAnnualBenefit / initialInvestment) * 100;

  // Bound the result to reasonable limits
  return Math.max(
    FINANCIAL_CONFIG.MIN_ROI_PERCENT,
    Math.min(FINANCIAL_CONFIG.MAX_ROI_PERCENT, roi)
  );
}

/**
 * Calculate Simple Payback Period correctly
 * @param {number} initialInvestment - Upfront capital cost
 * @param {Array} annualCashFlows - Array of net annual cash flows
 * @returns {number|null} Payback period in years, or null if no payback
 */
export function calculatePaybackPeriod(initialInvestment, annualCashFlows) {
  if (
    !initialInvestment ||
    initialInvestment <= 0 ||
    !annualCashFlows ||
    annualCashFlows.length === 0
  ) {
    return null;
  }

  let cumulativeCashFlow = -initialInvestment;

  for (let i = 0; i < annualCashFlows.length; i++) {
    cumulativeCashFlow += annualCashFlows[i];

    if (cumulativeCashFlow >= 0) {
      // Interpolate for more precise payback period
      const previousCumulative = cumulativeCashFlow - annualCashFlows[i];
      const fraction = Math.abs(previousCumulative) / annualCashFlows[i];
      return Math.round((i + fraction) * 10) / 10; // Round to 1 decimal
    }
  }

  return null; // No payback within project life
}

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * @param {number} initialInvestment - Upfront capital cost
 * @param {Array} annualCashFlows - Array of net annual cash flows
 * @param {number} maxIterations - Maximum iterations for convergence
 * @param {number} tolerance - Convergence tolerance
 * @returns {number|null} IRR as percentage, or null if not found
 */
export function calculateIRR(
  initialInvestment,
  annualCashFlows,
  maxIterations = 100,
  tolerance = 0.0001
) {
  if (!initialInvestment || !annualCashFlows || annualCashFlows.length === 0) {
    return null;
  }

  // Create cash flow array with initial investment as negative
  const cashFlows = [-initialInvestment, ...annualCashFlows];

  // Initial guess
  let rate = 0.1; // 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // derivative of NPV

    for (let j = 0; j < cashFlows.length; j++) {
      const year = j;
      const cashFlow = cashFlows[j];

      npv += cashFlow / Math.pow(1 + rate, year);
      if (year > 0) {
        dnpv -= (year * cashFlow) / Math.pow(1 + rate, year + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      return Math.round(rate * 1000) / 10; // Return as percentage with 1 decimal
    }

    if (dnpv === 0) break; // Avoid division by zero

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return Math.round(newRate * 1000) / 10;
    }

    rate = newRate;

    // Prevent infinite loops with unreasonable rates
    if (rate < -0.99 || rate > 5) break;
  }

  return null; // IRR not found
}

/**
 * Calculate comprehensive financial metrics for an intervention
 * @param {Object} params - Financial parameters
 * @param {number} params.initialInvestment - Upfront capital cost
 * @param {Array} params.annualBenefits - Array of annual benefits
 * @param {Array} params.annualCosts - Array of annual operating costs
 * @param {number} params.projectLife - Project lifespan in years
 * @returns {Object} Complete financial analysis
 */
export function calculateFinancialMetrics(params) {
  const {
    initialInvestment = 0,
    annualBenefits = [],
    annualCosts = [],
    projectLife = FINANCIAL_CONFIG.DEFAULT_PROJECT_LIFE,
  } = params;

  // Ensure arrays are of consistent length
  const maxLength = Math.max(
    annualBenefits.length,
    annualCosts.length,
    projectLife
  );
  const normalizedBenefits = Array(maxLength)
    .fill(0)
    .map((_, i) => annualBenefits[i] || 0);
  const normalizedCosts = Array(maxLength)
    .fill(0)
    .map((_, i) => annualCosts[i] || 0);

  // Calculate net annual cash flows
  const annualCashFlows = normalizedBenefits.map(
    (benefit, i) => benefit - normalizedCosts[i]
  );

  // Calculate all financial metrics
  const npv = calculateNPV(initialInvestment, annualCashFlows);
  const roi = calculateROI(initialInvestment, annualCashFlows);
  const paybackPeriod = calculatePaybackPeriod(
    initialInvestment,
    annualCashFlows
  );
  const irr = calculateIRR(initialInvestment, annualCashFlows);

  // Calculate benefit-cost ratio
  const totalBenefits = normalizedBenefits.reduce(
    (sum, benefit) => sum + benefit,
    0
  );
  const totalCosts =
    initialInvestment + normalizedCosts.reduce((sum, cost) => sum + cost, 0);
  const benefitCostRatio = totalCosts > 0 ? totalBenefits / totalCosts : 0;

  return {
    npv: Math.round(npv),
    roi: Math.round(roi * 10) / 10,
    paybackPeriod: paybackPeriod,
    irr: irr,
    benefitCostRatio: Math.round(benefitCostRatio * 100) / 100,
    totalBenefits: Math.round(totalBenefits),
    totalCosts: Math.round(totalCosts),
    netBenefit: Math.round(totalBenefits - totalCosts),
    annualCashFlows: annualCashFlows.map((cf) => Math.round(cf)),
    isViable: npv > 0 && paybackPeriod !== null && paybackPeriod <= projectLife,
    riskLevel:
      npv > 0
        ? paybackPeriod <= 5
          ? "Low"
          : paybackPeriod <= 10
          ? "Medium"
          : "High"
        : "Very High",
  };
}

/**
 * Validate financial inputs
 * @param {Object} params - Financial parameters to validate
 * @returns {Object} Validation result with errors and warnings
 */
export function validateFinancialInputs(params) {
  const errors = [];
  const warnings = [];

  const { initialInvestment, annualBenefits, annualCosts } = params;

  if (!initialInvestment || initialInvestment <= 0) {
    errors.push("Initial investment must be greater than zero");
  }

  if (!annualBenefits || annualBenefits.length === 0) {
    errors.push("Annual benefits array cannot be empty");
  }

  if (annualBenefits && annualBenefits.some((benefit) => benefit < 0)) {
    warnings.push("Some annual benefits are negative");
  }

  if (annualCosts && annualCosts.some((cost) => cost < 0)) {
    warnings.push("Some annual costs are negative");
  }

  const avgAnnualBenefit = annualBenefits
    ? annualBenefits.reduce((sum, b) => sum + b, 0) / annualBenefits.length
    : 0;
  if (
    initialInvestment &&
    avgAnnualBenefit &&
    avgAnnualBenefit / initialInvestment > 0.5
  ) {
    warnings.push(
      "ROI appears unusually high - please verify benefit calculations"
    );
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

export default {
  calculateNPV,
  calculateROI,
  calculatePaybackPeriod,
  calculateIRR,
  calculateFinancialMetrics,
  validateFinancialInputs,
  FINANCIAL_CONFIG,
};
