// Currency conversion utilities for Bangladesh Taka (BDT)

// Current exchange rate (as of 2025, approximate)
const USD_TO_BDT_RATE = 110; // 1 USD = 110 BDT (approximate)

/**
 * Convert USD to BDT
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in BDT
 */
export const convertUsdToBdt = (usdAmount) => {
  if (typeof usdAmount !== "number" || isNaN(usdAmount)) {
    return 0;
  }
  return Math.round(usdAmount * USD_TO_BDT_RATE);
};

/**
 * Format currency in BDT with appropriate symbol
 * @param {number} amount - Amount in any currency
 * @param {boolean} isUsd - Whether the amount is in USD (will be converted)
 * @returns {string} Formatted currency string
 */
export const formatBDT = (amount, isUsd = true) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "৳ 0";
  }

  const bdtAmount = isUsd ? convertUsdToBdt(amount) : amount;

  // Format with commas for thousands using English locale
  const formatted = bdtAmount.toLocaleString("en-US");

  return `৳ ${formatted}`;
};

/**
 * Get BDT symbol
 * @returns {string} BDT symbol
 */
export const getBDTSymbol = () => "৳";

/**
 * Format large numbers in a compact way (e.g., 1.2M, 50K)
 * @param {number} amount - Amount in any currency
 * @param {boolean} isUsd - Whether the amount is in USD (will be converted)
 * @returns {string} Compact formatted currency string
 */
export const formatBDTCompact = (amount, isUsd = true) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "৳ 0";
  }

  const bdtAmount = isUsd ? convertUsdToBdt(amount) : amount;

  if (bdtAmount >= 1000000000) {
    // 1 billion
    return `৳ ${(bdtAmount / 1000000000).toFixed(1)}B`;
  } else if (bdtAmount >= 1000000) {
    // 1 million
    return `৳ ${(bdtAmount / 1000000).toFixed(1)}M`;
  } else if (bdtAmount >= 1000) {
    // 1 thousand
    return `৳ ${(bdtAmount / 1000).toFixed(1)}K`;
  }

  return `৳ ${bdtAmount.toLocaleString("en-US")}`;
};

export default {
  convertUsdToBdt,
  formatBDT,
  getBDTSymbol,
  formatBDTCompact,
  USD_TO_BDT_RATE,
};
