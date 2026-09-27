const toHri100 = (hri12) => Number(((Number(hri12 || 0) / 12) * 100).toFixed(1));

const severity100 = (hri100) => {
  if (hri100 >= 70) return 'CRITICAL';
  if (hri100 >= 55) return 'HIGH';
  if (hri100 >= 35) return 'MODERATE';
  return 'LOW';
};

const addDualScale = (row) => {
  const hri12 = Number(row.final_hri || 0);
  const hri100 = toHri100(hri12);
  return {
    ...row,
    hri_12: hri12,
    severity_12: row.severity,
    hri_100: hri100,
    severity_100: severity100(hri100)
  };
};

module.exports = { toHri100, severity100, addDualScale };
