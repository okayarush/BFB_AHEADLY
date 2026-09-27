// List of Wards for Solapur Digital Twin
// Refactored to use SECTOR-XX Identifiers as per new architecture

// Mapping from Legacy Name (GeoJSON/CSV) to New Sector ID
export const WARD_NAME_TO_SECTOR = {
    "ashok chowk": "Sector-01",
    "bhavani peth": "Sector-02",
    "civil lines": "Sector-03",
    "hotgi road": "Sector-04",
    "jule solapur": "Sector-05",
    "midc area": "Sector-06",
    "navy peth": "Sector-07",
    "north solapur": "Sector-08",
    "railway lines": "Sector-09",
    "sadar bazar": "Sector-10",
    "south solapur": "Sector-11",
    "market yard": "Sector-12",
    // Fallbacks or expansion if GeoJSON has more
    "sector 13": "Sector-13",
    "sector 14": "Sector-14",
    "sector 15": "Sector-15",
    "sector 16": "Sector-16"
};

// Official Sector List for Dropdowns
export const SECTOR_LIST = [
    "Sector-01", "Sector-02", "Sector-03", "Sector-04",
    "Sector-05", "Sector-06", "Sector-07", "Sector-08",
    "Sector-09", "Sector-10", "Sector-11", "Sector-12",
    "Sector-13", "Sector-14", "Sector-15", "Sector-16"
];

// Helper to get Sector ID from flexible input
// Helper to get Sector ID from flexible input
export const getSectorID = (inputName) => {
    if (!inputName) return "Sector-01"; // Safe default instead of null

    const key = String(inputName).trim().toLowerCase();

    // 1. Direct Map Lookup (Legacy Names)
    if (WARD_NAME_TO_SECTOR[key]) {
        return WARD_NAME_TO_SECTOR[key];
    }

    // 2. Handle "Sector X", "Sector-X", "Ward X", or just "X"
    // Remove non-numeric characters to extract the number
    const match = key.match(/(\d+)/);

    if (match) {
        let num = parseInt(match[0], 10);

        // Clamp between 1 and 16
        if (num < 1) num = 1;
        if (num > 16) num = 16;

        // Return padded format "Sector-XX"
        return `Sector-${String(num).padStart(2, '0')}`;
    }

    // 3. Absolute Fallback
    return "Sector-01";
};
