/**
 * TelegramReportsManager
 * ─────────────────────────────────────────────────────────────────
 * Reads reports from /telegram_reports.json (written by the bot)
 * and caches them in localStorage for offline resilience.
 *
 * The file is polled every 30 s by DigitalTwin so new bot reports
 * appear on the map automatically without a page reload.
 * ─────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY   = 'urbanome_telegram_reports_v1';
const REPORTS_URL   = '/telegram_reports.json';

export const TelegramReportsManager = {

  /** Fetch from the public file (bot writes here) and update cache */
  async fetchAndSync() {
    try {
      const res = await fetch(`${REPORTS_URL}?t=${Date.now()}`); // cache-bust
      if (!res.ok) return TelegramReportsManager.getCached();
      const data = await res.json();
      if (!Array.isArray(data)) return TelegramReportsManager.getCached();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch {
      return TelegramReportsManager.getCached();
    }
  },

  /** Return last-known reports from localStorage */
  getCached() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Sanitation reports only (have lat/lng, can appear as map markers) */
  getSanitationReports() {
    return TelegramReportsManager.getCached().filter(
      r => r.type === 'sanitation' && r.latitude && r.longitude
    );
  },

  /** All reports regardless of type */
  getAll() {
    return TelegramReportsManager.getCached();
  },

  getCount() {
    return TelegramReportsManager.getCached().length;
  },

  getSanitationCount() {
    return TelegramReportsManager.getSanitationReports().length;
  },
};
