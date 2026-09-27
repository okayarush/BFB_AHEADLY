import { SECTOR_LIST } from "./HospitalRegistry";

const STORAGE_KEY = "urbanome_sanitation_reports_v1";

// Solapur Bounds for safe point generation (approximate)
const MIN_LAT = 17.60;
const MAX_LAT = 17.72;
const MIN_LNG = 75.85;
const MAX_LNG = 75.95;

const ISSUE_TYPES = [
    "Uncollected Garbage",
    "Open Drain / Sewage",
    "Stagnant Water",
    "Overflowing Public Bin",
    "Broken Public Toilet"
];

// Helper to generate random coord near Solapur center
const getRandomCoord = () => {
    return {
        lat: MIN_LAT + Math.random() * (MAX_LAT - MIN_LAT),
        lng: MIN_LNG + Math.random() * (MAX_LNG - MIN_LNG)
    };
};

export const CommunitySanitationManager = {
    // 1. Initialize Mock Data
    initializeData: () => {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) return; // Already exists

        const mockReports = [];

        // Ensure every sector has at least 1 report
        SECTOR_LIST.forEach((sector, index) => {
            // Determine risk profile based on index for variance
            let reportCount = 1; // Default LOW
            if (index % 3 === 0) reportCount = 7; // HIGH (e.g., Sector-01, 04...)
            else if (index % 3 === 1) reportCount = 4; // MEDIUM (e.g., Sector-02, 05...)

            for (let i = 0; i < reportCount; i++) {
                const coord = getRandomCoord();
                mockReports.push({
                    id: `mock-${sector}-${i}`,
                    sector: sector,
                    issue_type: ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)],
                    latitude: coord.lat,
                    longitude: coord.lng,
                    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(), // Last 7 days
                    has_proof: true,
                    note: "Automated system check report (Mock Log)",
                    isMock: true
                });
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReports));
    },

    // 2. Get All Reports
    getAllReports: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 3. Get Reports for Sector
    getSectorReports: (sectorId) => {
        const all = CommunitySanitationManager.getAllReports();
        return all.filter(r => r.sector === sectorId);
    },

    // 4. Add New Report
    addReport: (report) => {
        const all = CommunitySanitationManager.getAllReports();
        const newReport = {
            ...report,
            id: `usr-${Date.now()}`,
            timestamp: new Date().toISOString(),
            has_proof: true
        };
        all.push(newReport);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return true;
    },

    // 5. Calculate Risk for Sector
    getSectorRisk: (sectorId) => {
        const reports = CommunitySanitationManager.getSectorReports(sectorId);

        // Filter last 7 days? User requirement says "Aggregate reports per sector, last 7 days"
        // Ideally we filter by date, but for simplicity let's use all for now or simple check
        // Let's implement 7 day filter for correctness as requested
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentReports = reports.filter(r => new Date(r.timestamp) >= sevenDaysAgo);
        const count = recentReports.length;

        let risk = "LOW";
        if (count >= 6) risk = "HIGH";
        else if (count >= 3) risk = "MEDIUM";

        // Most common issue
        const counts = {};
        let dominantIssue = "None";
        let maxIssueCount = 0;

        recentReports.forEach(r => {
            counts[r.issue_type] = (counts[r.issue_type] || 0) + 1;
            if (counts[r.issue_type] > maxIssueCount) {
                maxIssueCount = counts[r.issue_type];
                dominantIssue = r.issue_type;
            }
        });

        return {
            level: risk, // HIGH, MEDIUM, LOW
            count: count,
            dominantIssue: dominantIssue
        };
    },

    // 6. Get Aggregated Risk Table for Map Styling
    getRiskTable: () => {
        const table = {};
        SECTOR_LIST.forEach(sector => {
            table[sector] = CommunitySanitationManager.getSectorRisk(sector);
        });
        return table;
    }
};
