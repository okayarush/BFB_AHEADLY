import { SECTOR_LIST } from "./HospitalRegistry";
import { CommunitySanitationManager } from "./CommunitySanitationManager";
import { TelegramReportsManager } from "./TelegramReportsManager";

/**
 * @typedef {Object} SectorCommunityProfile
 * @property {string}  sectorId            - e.g. 'Sector-01'
 * @property {number}  count               - merged report count, last 7 days
 * @property {string}  dominantIssue       - most reported issue_type or 'None'
 * @property {string}  level               - 'HIGH' | 'MEDIUM' | 'LOW'
 * @property {number}  score               - 0.2–1.4 numeric community score
 * @property {number}  max                 - always 1.4
 * @property {string}  note                - human-readable for UI display
 * @property {number}  sanitationCount     - reports from CommunitySanitationManager
 * @property {number}  telegramCount       - reports from TelegramReportsManager (type==='sanitation')
 */

// Max possible community score — constant across all sectors (matches plannerState hardcoded max)
const COMMUNITY_SCORE_MAX = 1.4;

// Cache duration in milliseconds
const CACHE_TTL_MS = 60_000; // 60 seconds

let _cache = null; // { table: { [sectorId]: SectorCommunityProfile }, computedAt: number }

/**
 * Map report count to a numeric score (0.2–1.4 scale)
 * Derived from plannerState.js hardcoded community contributor scores
 */
function _countToScore(count) {
  if (count === 0) return 0.2;
  if (count <= 2) return 0.4;
  if (count <= 4) return 0.6;
  if (count <= 7) return 0.8;
  if (count <= 11) return 1.0;
  if (count <= 15) return 1.1;
  if (count <= 20) return 1.2;
  return 1.4;
}

/**
 * Map report count to risk level
 */
function _countToRiskLevel(count) {
  if (count >= 6) return 'HIGH';
  if (count >= 3) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate human-readable note based on count and dominant issue
 */
function _buildNote(count, dominantIssue) {
  if (count === 0) return 'No active reports';
  if (count <= 2) return `Minimal ${dominantIssue.toLowerCase()} complaints`;
  if (count <= 7) return `${count} ${dominantIssue.toLowerCase()} reports this week`;
  if (count <= 15) return `${count} ${dominantIssue.toLowerCase()} reports · multiple sub-wards`;
  return `${count} ${dominantIssue.toLowerCase()} reports this week`;
}

/**
 * Find the dominant issue type from a list of reports
 */
function _getDominantIssue(reports) {
  if (reports.length === 0) return 'None';

  const counts = {};
  let topIssue = 'None';
  let maxCount = 0;

  reports.forEach(r => {
    const issueType = r.issue_type || r.type || 'Unknown';
    counts[issueType] = (counts[issueType] || 0) + 1;
    if (counts[issueType] > maxCount) {
      maxCount = counts[issueType];
      topIssue = issueType;
    }
  });

  return topIssue;
}

/**
 * Get reports from both sources within the 7-day window for a specific sector
 */
function _mergeRecentForSector(sectorId, sanitationAll, telegramAll, cutoff) {
  // Sanitation reports: filter by sector and date
  const sanitation = sanitationAll.filter(r =>
    r.sector === sectorId && new Date(r.timestamp) >= cutoff
  );

  // Telegram reports: must have type='sanitation', sector match, and recent date
  const telegram = telegramAll.filter(r =>
    r.sector === sectorId &&
    r.type === 'sanitation' &&
    new Date(r.timestamp) >= cutoff
  );

  return [...sanitation, ...telegram];
}

/**
 * Compute the full risk table across all sectors
 */
function _computeTable() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const sanitationAll = CommunitySanitationManager.getAllReports();
  const telegramAll = TelegramReportsManager.getAll();

  const table = {};

  SECTOR_LIST.forEach(sectorId => {
    const recentReports = _mergeRecentForSector(sectorId, sanitationAll, telegramAll, cutoff);
    const count = recentReports.length;
    const dominantIssue = _getDominantIssue(recentReports);
    const score = _countToScore(count);
    const level = _countToRiskLevel(count);
    const note = _buildNote(count, dominantIssue);

    // Breakdown by source for transparency
    const sanitationRecent = sanitationAll.filter(r =>
      r.sector === sectorId && new Date(r.timestamp) >= cutoff
    );
    const telegramRecent = telegramAll.filter(r =>
      r.sector === sectorId && r.type === 'sanitation' && new Date(r.timestamp) >= cutoff
    );

    table[sectorId] = {
      sectorId,
      count,
      dominantIssue,
      level,
      score,
      max: COMMUNITY_SCORE_MAX,
      note,
      sanitationCount: sanitationRecent.length,
      telegramCount: telegramRecent.length,
    };
  });

  return table;
}

/**
 * CommunityIntelligenceManager
 *
 * Single source of truth for community data. Aggregates CommunitySanitationManager
 * and TelegramReportsManager into sector-level intelligence with computed scores
 * for HRI and planner systems.
 */
export const CommunityIntelligenceManager = {
  /**
   * Get the full risk table across all sectors.
   * Cached for CACHE_TTL_MS; call refresh() after mutations.
   *
   * @returns {{ [sectorId]: SectorCommunityProfile }}
   */
  getRiskTable() {
    const now = Date.now();
    if (_cache && now - _cache.computedAt < CACHE_TTL_MS) {
      return _cache.table;
    }

    _cache = {
      table: _computeTable(),
      computedAt: now,
    };

    return _cache.table;
  },

  /**
   * Get the community profile for a single sector
   *
   * @param {string} sectorId - e.g. 'Sector-01'
   * @returns {SectorCommunityProfile}
   */
  getSectorProfile(sectorId) {
    const table = this.getRiskTable();
    return table[sectorId] ?? {
      sectorId,
      count: 0,
      dominantIssue: 'None',
      level: 'LOW',
      score: 0.2,
      max: COMMUNITY_SCORE_MAX,
      note: 'No active reports',
      sanitationCount: 0,
      telegramCount: 0,
    };
  },

  /**
   * Get sector risk in the original CommunitySanitationManager format.
   * Provides backward compatibility for hriBridgeService and DigitalTwin tooltips.
   *
   * @param {string} sectorId
   * @returns {{ level: string, count: number, dominantIssue: string }}
   */
  getSectorRisk(sectorId) {
    const profile = this.getSectorProfile(sectorId);
    return {
      level: profile.level,
      count: profile.count,
      dominantIssue: profile.dominantIssue,
    };
  },

  /**
   * Get the plannerState-compatible contributor object for one sector.
   *
   * @param {string} sectorId - e.g. 'Sector-03'
   * @returns {{ source: string, icon: string, score: number, max: number, color: string, note: string }}
   */
  getCommunityContributor(sectorId) {
    const profile = this.getSectorProfile(sectorId);
    return {
      source: 'Community Reports',
      icon: '👥',
      score: profile.score,
      max: profile.max,
      color: '#2dd48a',
      note: profile.note,
    };
  },

  /**
   * Get all merged reports across both sources (unfiltered by date).
   * Used by DashboardStatManager for signal generation.
   *
   * @returns {Array}
   */
  getAllReports() {
    const sanitation = CommunitySanitationManager.getAllReports();
    const telegram = TelegramReportsManager.getAll().filter(r => r.type === 'sanitation');
    return [...sanitation, ...telegram];
  },

  /**
   * Invalidate the cache. Call after any mutation (e.g., addReport in CommunitySanitation.js).
   */
  refresh() {
    _cache = null;
  },
};
