/**
 * Aheadly Telegram Bot
 * ─────────────────────────────────────────────────────────────────
 * Citizen health & sanitation reporting bot for Solapur (Urbanome)
 *
 * SETUP:
 *   1. cp .env.example .env  →  add your TELEGRAM_BOT_TOKEN
 *   2. npm install
 *   3. npm start
 *
 * Reports are saved to: ../client/public/telegram_reports.json
 * ASHA surveys: ../client/public/asha_surveys.json
 * ASHA signals: ../client/public/asha_ward_signals.json
 * The React frontend polls those files every 30 s.
 * ─────────────────────────────────────────────────────────────────
 *
 * MODES
 *  citizen (default) — existing sanitation / symptom / passport flows
 *  asha              — ASHA Field Worker structured survey flow
 * ─────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

/* ─── CONFIG ─────────────────────────────────────────────────── */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('❌  TELEGRAM_BOT_TOKEN not set. Copy .env.example → .env and add your token.');
  process.exit(1);
}

const REPORTS_FILE       = path.resolve(__dirname, '../client/public/telegram_reports.json');
const ASHA_SURVEYS_FILE  = path.resolve(__dirname, '../client/public/asha_surveys.json');
const ASHA_SIGNALS_FILE  = path.resolve(__dirname, '../client/public/asha_ward_signals.json');
const PHOTOS_DIR         = path.resolve(__dirname, '../client/public/telegram_photos');
const KNOWN_CHATS_FILE   = path.resolve(__dirname, 'known_chats.json');
const MAX_REPORTS        = 200;
const MAX_ASHA_SURVEYS   = 500;

// Track all chat IDs that have ever messaged the bot
function loadKnownChats() {
  try { return JSON.parse(fs.readFileSync(KNOWN_CHATS_FILE, 'utf8')); } catch { return []; }
}
function saveKnownChat(chatId) {
  const chats = loadKnownChats();
  if (!chats.includes(chatId)) {
    chats.push(chatId);
    fs.writeFileSync(KNOWN_CHATS_FILE, JSON.stringify(chats, null, 2));
    console.log(`📋 New chat ID saved: ${chatId}`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

/* ─── WARD MAPPING ───────────────────────────────────────────── */

const WARD_NAME_TO_SECTOR = {
  'ashok chowk':  'Sector-01',
  'bhavani peth': 'Sector-02',
  'civil lines':  'Sector-03',
  'hotgi road':   'Sector-04',
  'jule solapur': 'Sector-05',
  'midc area':    'Sector-06',
  'navy peth':    'Sector-07',
  'north solapur':'Sector-08',
  'railway lines':'Sector-09',
  'sadar bazar':  'Sector-10',
  'south solapur':'Sector-11',
  'market yard':  'Sector-11',
};

function getSectorID(name) {
  if (!name) return 'Sector-01';
  const key = String(name).trim().toLowerCase();
  if (WARD_NAME_TO_SECTOR[key]) return WARD_NAME_TO_SECTOR[key];
  const match = key.match(/(\d+)/);
  if (match) {
    const num = Math.min(16, Math.max(1, parseInt(match[0], 10)));
    return `Sector-${String(num).padStart(2, '0')}`;
  }
  return 'Sector-01';
}

// Simple ray-casting point-in-polygon
function pointInPolygon(point, ring) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Load GeoJSON once at startup for accurate ward detection
let wardsGeoJSON = null;
try {
  const geoPath = path.resolve(__dirname, '../client/public/solapur_wards.geojson');
  wardsGeoJSON = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  console.log('✅  Ward GeoJSON loaded — precise ward mapping enabled');
} catch {
  console.warn('⚠️   Could not load ward GeoJSON — using grid fallback for ward mapping');
}

function getWardFromLatLng(lat, lng) {
  if (wardsGeoJSON) {
    for (const feature of wardsGeoJSON.features) {
      try {
        const geom = feature.geometry;
        const rings = geom.type === 'Polygon'
          ? [geom.coordinates[0]]
          : geom.coordinates.map(p => p[0]);
        for (const ring of rings) {
          if (pointInPolygon([lng, lat], ring)) {
            return getSectorID(feature.properties.Name);
          }
        }
      } catch { /* skip malformed feature */ }
    }
  }
  // Fallback: divide Solapur bounding box into 4×4 grid → 16 sectors
  const LAT_MIN = 17.60, LAT_MAX = 17.72;
  const LNG_MIN = 75.85, LNG_MAX = 75.96;
  const row = Math.min(3, Math.max(0, Math.floor(((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 4)));
  const col = Math.min(3, Math.max(0, Math.floor(((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 4)));
  return `Sector-${String(row * 4 + col + 1).padStart(2, '0')}`;
}

/* ─── REPORT PERSISTENCE ─────────────────────────────────────── */

function loadReports() {
  try {
    if (fs.existsSync(REPORTS_FILE)) return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
  } catch { /* file missing or corrupt */ }
  return [];
}

function saveReport(report) {
  const reports = loadReports();
  // Prepend so newest-first in file; honour pre-set id (e.g. from photo handler)
  reports.unshift({ id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...report });
  try {
    fs.mkdirSync(path.dirname(REPORTS_FILE), { recursive: true });
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports.slice(0, MAX_REPORTS), null, 2));
    console.log(`📥  Report saved → ${report.sector} | ${report.issue_type || report.classification}`);
  } catch (e) {
    console.error('❌  Failed to write reports file:', e.message);
  }
}

/* ─── USER STATE MACHINE ─────────────────────────────────────── */
// Citizen steps : idle | awaiting_issue_type | awaiting_location | awaiting_photo | awaiting_symptoms
// ASHA steps    : asha_awaiting_id | asha_awaiting_name |
//                 asha_household   | asha_location      | asha_symptoms |
//                 asha_sanitation  | asha_vaccination   | asha_notes

// Each user entry: { mode: 'citizen'|'asha', step: '...', data: {} }
const userStates = {};

const getState  = (id) => userStates[id] || { mode: 'citizen', step: 'idle', data: {} };
const setState  = (id, step, extra = {}) => {
  const cur = getState(id);
  userStates[id] = { mode: cur.mode || 'citizen', step, data: { ...cur.data, ...extra } };
};
const setMode   = (id, mode, step, data = {}) => {
  userStates[id] = { mode, step, data };
};
const clearState = (id) => { delete userStates[id]; };

/* ─── ISSUE TYPES ─────────────────────────────────────────────── */

const ISSUE_INLINE_KB = {
  inline_keyboard: [
    [
      { text: '🗑 Garbage',       callback_data: 'issue_Uncollected Garbage' },
      { text: '💧 Stagnant Water', callback_data: 'issue_Stagnant Water' },
    ],
    [
      { text: '🌊 Open Drain',    callback_data: 'issue_Open Drain / Sewage' },
      { text: '🗑 Overflow Bin',  callback_data: 'issue_Overflowing Public Bin' },
    ],
    [
      { text: '🚽 Broken Toilet', callback_data: 'issue_Broken Public Toilet' },
    ],
  ],
};

const SYMPTOM_INLINE_KB = {
  inline_keyboard: [
    [
      { text: '🌡 Fever',      callback_data: 'sym_fever' },
      { text: '💪 Body Pain',  callback_data: 'sym_pain' },
    ],
    [
      { text: '🤕 Headache',   callback_data: 'sym_headache' },
      { text: '🤢 Nausea',     callback_data: 'sym_nausea' },
    ],
    [
      { text: '😮‍💨 Cough',  callback_data: 'sym_cough' },
      { text: '✅ Done →',     callback_data: 'sym_done' },
    ],
  ],
};

/* ─── BOT INSTANCE ───────────────────────────────────────────── */

const bot = new TelegramBot(TOKEN, { polling: true });

/* ─── HELPER: send with parse_mode Markdown ──────────────────── */
const sendMD = (chatId, text, opts = {}) =>
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });

/* ─── WELCOME ────────────────────────────────────────────────── */

const WELCOME_TEXT = `*Welcome to Aheadly!* 🏙️
I'm your civic health assistant for *Solapur*.

*What I can do:*
📍 Log sanitation issues (garbage, drains, water)
🤒 Quick symptom triage
🪪 Show your health passport

*Just type:*
→ \`report\` or \`sanitation\` — file a sanitation issue
→ \`fever\` or \`symptoms\`   — health symptom check
→ \`passport\`               — your health passport
→ \`help\`                   — full command list`;

bot.onText(/^\/start$/i, (msg) => {
  saveKnownChat(msg.chat.id);
  clearState(msg.chat.id);
  sendMD(msg.chat.id, WELCOME_TEXT);
});

bot.onText(/^\/mychatid$/i, (msg) => {
  saveKnownChat(msg.chat.id);
  sendMD(msg.chat.id, `🆔 Your Chat ID is:\n\`${msg.chat.id}\`\n\nShare this with the dashboard to receive advisories.`);
});

/* ─── ASHA MODE TRIGGER ──────────────────────────────────────── */

bot.onText(/^ASHA$/i, (msg) => {
  const chatId = msg.chat.id;
  setMode(chatId, 'asha', 'asha_awaiting_id', {});
  sendMD(chatId,
    `🩺 *ASHA Field Worker Mode Activated*
─────────────────────────────
Welcome to the Aheadly Field Survey System.
Your responses feed directly into the *Solapur Digital Twin*.

Please enter your *ASHA Worker ID*:`
  );
});

/* ─── EXIT MODE ──────────────────────────────────────────────── */

bot.onText(/^EXIT$/i, (msg) => {
  const chatId = msg.chat.id;
  const wasAsha = getState(chatId).mode === 'asha';
  setMode(chatId, 'citizen', 'idle', {});
  sendMD(chatId,
    wasAsha
      ? `👋 Exited ASHA Mode. You're back in citizen mode.\n\nType \`report\`, \`fever\`, or \`passport\` to continue.`
      : `ℹ️ Type \`ASHA\` to enter Field Worker Mode.`
  );
});

bot.onText(/^(hi|hello|hey|namaste|hii|helo)$/i, (msg) => {
  clearState(msg.chat.id);
  sendMD(msg.chat.id, WELCOME_TEXT);
});

/* ─── SANITATION FLOW ────────────────────────────────────────── */

function startSanitationFlow(chatId) {
  setState(chatId, 'awaiting_issue_type');
  sendMD(chatId, 'What type of sanitation issue do you want to report?', {
    reply_markup: ISSUE_INLINE_KB,
  });
}

bot.onText(/report|sanitation|garbage|drain|toilet|bin/i, (msg) => {
  const st = getState(msg.chat.id);
  if (st.mode === 'asha') return;          // ignore in ASHA mode
  if (st.step !== 'idle') return;
  startSanitationFlow(msg.chat.id);
});

/* ─── SYMPTOM FLOW ───────────────────────────────────────────── */

function startSymptomFlow(chatId) {
  setState(chatId, 'awaiting_symptoms', { symptoms: [] });
  sendMD(chatId, 'Select your symptoms _(tap each, then Done)_:', {
    reply_markup: SYMPTOM_INLINE_KB,
  });
}

bot.onText(/fever|pain|headache|symptoms|sick|unwell|nausea|cough/i, (msg) => {
  const st = getState(msg.chat.id);
  if (st.mode === 'asha') return;          // ignore in ASHA mode
  if (st.step !== 'idle') return;
  startSymptomFlow(msg.chat.id);
});

/* ─── HEALTH PASSPORT ────────────────────────────────────────── */

bot.onText(/passport|health card|healthcard/i, (msg) => {
  const st = getState(msg.chat.id);
  if (st.mode === 'asha') return;          // ignore in ASHA mode
  if (st.step !== 'idle') return;

  const uid = String(msg.from.id).slice(-6);
  sendMD(msg.chat.id,
    `*🪪 Aheadly Health Passport*
─────────────────────────
👤 *Citizen ID:* SMC-${uid}
🏙️ *City:* Solapur, Maharashtra
📋 *Status:* Active & Verified

*Vaccination Records:*
✅ BCG Vaccination
✅ Oral Polio Vaccine (OPV)
✅ Hepatitis B — 3 doses
⚠️ Dengue awareness flag — active zone

*Last Health Check:* ${new Date().toLocaleDateString('en-IN')}
*Nearest PHC:* Hotgi Road Primary Health Centre
📞 *Emergency:* 108  |  🏥 *Health Line:* 104

_Tap below to open your full passport →_`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🌐 Open Full Passport', url: 'http://localhost:3000/health-passport' },
        ]],
      },
    }
  );
});

/* ─── HELP ───────────────────────────────────────────────────── */

bot.onText(/help|\/help/i, (msg) => {
  const mode = getState(msg.chat.id).mode;
  if (mode === 'asha') {
    sendMD(msg.chat.id,
      `*🩺 ASHA Mode — Commands*

🔢 Progress through the survey steps by typing your response.
📍 At the location step, share your GPS location via the 📎 attachment.

*During survey:*
→ Type your answer and press send
→ For symptoms / sanitation / vaccination, type the number or keyword

*Any time:*
→ \`EXIT\` — return to citizen mode
→ \`ASHA\`  — restart ASHA mode (new survey)

_Your data feeds directly into Aheadly's Digital Twin._`
    );
    return;
  }
  sendMD(msg.chat.id,
    `*Aheadly Bot — Commands*

📍 *Sanitation*
→ \`report\`   — start a sanitation report
→ \`garbage\`  — report garbage issue
→ \`drain\`    — report open drain

🤒 *Health*
→ \`symptoms\` — select symptoms for triage
→ \`fever\`    — quick fever check

🪪 *Passport*
→ \`passport\` — view health passport

🩺 *ASHA Field Worker*
→ \`ASHA\`     — enter field data collection mode

💡 *Tips*
• Share your GPS location for accurate ward mapping
• Add a photo — reports with evidence are resolved faster
• Your report appears in Solapur's Digital Twin within 30 s

_Made with ❤️ by Team Urbanome_`
  );
});

/* ─── CALLBACK QUERY HANDLER ─────────────────────────────────── */

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data   = query.data;
  const state  = getState(chatId);

  await bot.answerCallbackQuery(query.id);

  /* --- Issue type selected ------------------------------------ */
  if (data.startsWith('issue_')) {
    const issueType = data.replace('issue_', '');
    setState(chatId, 'awaiting_location', { issue_type: issueType });
    sendMD(chatId,
      `Got it! *${issueType}* 📍\n\nNow please *share your location* so I can identify the correct ward.\n\n_Tap the 📎 paperclip → Location_`
    );
    return;
  }

  /* --- Symptom toggle ----------------------------------------- */
  if (data.startsWith('sym_') && data !== 'sym_done') {
    const sym = data.replace('sym_', '');
    const current = state.data.symptoms || [];
    const idx = current.indexOf(sym);
    if (idx === -1) current.push(sym); else current.splice(idx, 1);
    setState(chatId, 'awaiting_symptoms', { symptoms: current });
    const display = current.length ? current.map(s => `✅ ${s}`).join('  ') : '_none selected_';
    sendMD(chatId, `*Selected:* ${display}\n\nTap more or press *Done →* when finished.`, {
      reply_markup: SYMPTOM_INLINE_KB,
    });
    return;
  }

  /* --- Symptom done ------------------------------------------- */
  if (data === 'sym_done') {
    const symptoms = state.data.symptoms || [];
    if (!symptoms.length) {
      bot.sendMessage(chatId, 'Please select at least one symptom first.');
      return;
    }

    const hasFever  = symptoms.includes('fever');
    const hasPain   = symptoms.includes('pain');
    const hasNausea = symptoms.includes('nausea');

    let classification = 'General Illness';
    let urgency = '🟡 Moderate';
    let advice  = 'Visit your nearest Primary Health Centre for evaluation.';

    if (hasFever && hasPain) {
      classification = 'Dengue-like Syndrome';
      urgency = '🔴 High — see a doctor today';
      advice  = 'Fever + body pain may indicate dengue. Stay hydrated, *avoid aspirin*. Visit Hotgi Road PHC or call 104.';
    } else if (hasFever && hasNausea) {
      classification = 'Possible Typhoid / Gastroenteritis';
      urgency = '🟠 Elevated — visit PHC within 24 hrs';
      advice  = 'Avoid raw food, drink boiled water. Blood test recommended at nearest health centre.';
    } else if (hasFever) {
      classification = 'Febrile Illness';
      urgency = '🟡 Moderate — monitor for 24 hrs';
      advice  = 'Rest and stay hydrated. If fever exceeds 38.5 °C for 2+ days, visit PHC.';
    }

    saveReport({
      type: 'symptom',
      source: 'telegram',
      classification,
      symptoms,
      sector: state.data.lastSector || 'Sector-04',
      timestamp: new Date().toISOString(),
    });

    clearState(chatId);
    sendMD(chatId,
      `*🩺 Triage Assessment*
─────────────────────────
*Symptoms:* ${symptoms.join(', ')}
*Classification:* ${classification}
*Urgency:* ${urgency}

*Advice:* ${advice}

🏥 *PHC:* Hotgi Road Primary Health Centre
📞 *Health Helpline:* 104`
    );
    return;
  }

  /* --- Photo attach ------------------------------------------ */
  if (data === 'photo_attach') {
    bot.sendMessage(chatId, '📸 Go ahead — send your photo now.');
    return;
  }

  /* --- Photo skip --------------------------------------------- */
  if (data === 'photo_skip') {
    const d = state.data;
    saveReport({
      type: 'sanitation',
      issue_type: d.issue_type,
      source: 'telegram',
      sector: d.sector,
      latitude: d.location?.lat,
      longitude: d.location?.lng,
      location: d.location,
      has_proof: false,
      note: 'Reported via Telegram',
      timestamp: new Date().toISOString(),
    });
    clearState(chatId);
    sendMD(chatId,
      `✅ *Report Submitted!*

📍 *Ward:* ${d.sector}
🔖 *Issue:* ${d.issue_type}
📱 *Source:* Telegram

Thank you for making Solapur healthier! This issue is now visible in the *Urbanome Digital Twin*. 🏙️`
    );
  }
});

/* ─── LOCATION ───────────────────────────────────────────────── */

bot.on('location', (msg) => {
  const chatId = msg.chat.id;
  const state  = getState(chatId);

  /* ── ASHA location step ─────────────────────────────────────── */
  if (state.mode === 'asha' && state.step === 'asha_location') {
    const { latitude, longitude } = msg.location;
    const ward = getWardFromLatLng(latitude, longitude);
    setState(chatId, 'asha_symptoms', {
      location: { lat: latitude, lng: longitude },
      ward,
    });
    sendMD(chatId,
      `📍 *Location recorded* — Ward: *${ward}*

🤒 *Step 3 of 6 — Symptoms*
Select all that apply (type numbers separated by commas, or names):

1️⃣  Fever
2️⃣  Cough
3️⃣  Joint Pain
4️⃣  Diarrhoea
5️⃣  Skin Rash
6️⃣  None

_Example: 1,2  or  Fever, Cough_`
    );
    return;
  }

  /* ── Citizen location step ──────────────────────────────────── */
  if (state.step !== 'awaiting_location') {
    bot.sendMessage(chatId, "Thanks! To report an issue, type 'report' first.");
    return;
  }

  const { latitude, longitude } = msg.location;
  const sector = getWardFromLatLng(latitude, longitude);

  setState(chatId, 'awaiting_photo', {
    location: { lat: latitude, lng: longitude },
    sector,
    lastSector: sector,
  });

  sendMD(chatId,
    `📍 Location received!\n*Ward: ${sector}*\n\nWould you like to add a photo as evidence? 📸`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '📸 Add Photo', callback_data: 'photo_attach' },
          { text: 'Skip →',       callback_data: 'photo_skip' },
        ]],
      },
    }
  );
});

/* ─── PHOTO ──────────────────────────────────────────────────── */

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const state  = getState(chatId);

  if (state.step !== 'awaiting_photo') {
    bot.sendMessage(chatId, "To attach a photo, start a report first — type 'report'.");
    return;
  }

  const d = state.data;

  // Generate a stable ID so the photo filename matches the report
  const reportId = `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Download the highest-resolution version of the photo
  let photoPath = null;
  try {
    const largest   = msg.photo[msg.photo.length - 1]; // Telegram sends multiple sizes
    const fileLink  = await bot.getFileLink(largest.file_id);
    const filename  = `${reportId}.jpg`;
    const localDest = path.join(PHOTOS_DIR, filename);
    await downloadFile(fileLink, localDest);
    photoPath = `/telegram_photos/${filename}`;
    console.log(`📸  Photo saved: ${localDest}`);
  } catch (e) {
    console.warn('⚠️   Could not download photo:', e.message);
  }

  saveReport({
    id: reportId,
    type: 'sanitation',
    issue_type: d.issue_type,
    source: 'telegram',
    sector: d.sector,
    latitude: d.location?.lat,
    longitude: d.location?.lng,
    location: d.location,
    has_proof: true,
    photo_path: photoPath,
    note: msg.caption || null,
    timestamp: new Date().toISOString(),
  });

  clearState(chatId);
  sendMD(chatId,
    `✅ *Report Submitted with Photo!*

📍 *Ward:* ${d.sector}
🔖 *Issue:* ${d.issue_type}
📸 *Evidence:* Saved
📱 *Source:* Telegram

Thank you! Visible in *Urbanome Digital Twin* now. 🏙️`
  );
});

/* ═══════════════════════════════════════════════════════════════
   ASHA SURVEY FLOW — text message handler
   Runs before the citizen catch-all
   ═══════════════════════════════════════════════════════════════ */

/* ── ASHA persistence helpers ───────────────────────────────── */

function loadAshaSurveys() {
  try {
    if (fs.existsSync(ASHA_SURVEYS_FILE)) return JSON.parse(fs.readFileSync(ASHA_SURVEYS_FILE, 'utf8'));
  } catch { /* missing or corrupt */ }
  return [];
}

function saveAshaSurvey(survey) {
  const surveys = loadAshaSurveys();
  surveys.unshift({ id: `asha-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...survey });
  try {
    fs.mkdirSync(path.dirname(ASHA_SURVEYS_FILE), { recursive: true });
    fs.writeFileSync(ASHA_SURVEYS_FILE, JSON.stringify(surveys.slice(0, MAX_ASHA_SURVEYS), null, 2));
    console.log(`🩺  ASHA survey saved → ${survey.ward} | ASHA ${survey.ashaId}`);
  } catch (e) {
    console.error('❌  Failed to write ASHA surveys file:', e.message);
  }
}

/* ── Ward signal store (in-memory + persisted) ──────────────── */

const SIGNAL_CAPS = { diseaseBurden: 25, sanitationStress: 15 };

function loadWardSignals() {
  try {
    if (fs.existsSync(ASHA_SIGNALS_FILE)) return JSON.parse(fs.readFileSync(ASHA_SIGNALS_FILE, 'utf8'));
  } catch { /* missing or corrupt */ }
  return {};
}

function saveWardSignals(signals) {
  try {
    fs.mkdirSync(path.dirname(ASHA_SIGNALS_FILE), { recursive: true });
    fs.writeFileSync(ASHA_SIGNALS_FILE, JSON.stringify(signals, null, 2));
  } catch (e) {
    console.error('❌  Failed to write ASHA signals file:', e.message);
  }
}

// In-memory cache — loaded once at start
const wardSignals = loadWardSignals();

function ensureWardEntry(ward) {
  if (!wardSignals[ward]) wardSignals[ward] = { diseaseBurden: 0, sanitationStress: 0, surveys: 0, lastUpdated: null };
}

function increaseDiseaseBurden(ward) {
  ensureWardEntry(ward);
  wardSignals[ward].diseaseBurden = Math.min(
    SIGNAL_CAPS.diseaseBurden,
    (wardSignals[ward].diseaseBurden || 0) + 2
  );
  wardSignals[ward].lastUpdated = new Date().toISOString();
  saveWardSignals(wardSignals);
  console.log(`📈  Disease burden +2 → ${ward} (now ${wardSignals[ward].diseaseBurden})`);
}

function increaseSanitationStress(ward) {
  ensureWardEntry(ward);
  wardSignals[ward].sanitationStress = Math.min(
    SIGNAL_CAPS.sanitationStress,
    (wardSignals[ward].sanitationStress || 0) + 1
  );
  wardSignals[ward].lastUpdated = new Date().toISOString();
  saveWardSignals(wardSignals);
  console.log(`📈  Sanitation stress +1 → ${ward} (now ${wardSignals[ward].sanitationStress})`);
}

/* ── Symptom parsing helper ─────────────────────────────────── */
const SYMPTOM_MAP = {
  '1': 'Fever',      'fever': 'Fever',
  '2': 'Cough',      'cough': 'Cough',
  '3': 'Joint Pain', 'joint': 'Joint Pain', 'joint pain': 'Joint Pain',
  '4': 'Diarrhoea',  'diarrhoea': 'Diarrhoea', 'diarrhea': 'Diarrhoea',
  '5': 'Skin Rash',  'skin': 'Skin Rash',  'rash': 'Skin Rash',
  '6': 'None',       'none': 'None',
};

function parseSymptoms(text) {
  const tokens = text.toLowerCase().split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
  const found = new Set();
  tokens.forEach(t => { if (SYMPTOM_MAP[t]) found.add(SYMPTOM_MAP[t]); });
  return found.size ? [...found] : null;
}

/* ── Sanitation parsing helper ──────────────────────────────── */
const SANITATION_MAP = {
  '1': 'Clean',           'clean': 'Clean',
  '2': 'Stagnant Water',  'stagnant': 'Stagnant Water', 'water': 'Stagnant Water',
  '3': 'Garbage Nearby',  'garbage': 'Garbage Nearby',
  '4': 'Open Drain',      'drain': 'Open Drain',
};

function parseSanitation(text) {
  const key = text.trim().toLowerCase();
  return SANITATION_MAP[key] || null;
}

/* ── Vaccination parsing helper ─────────────────────────────── */
const VACCINATION_MAP = {
  '1': 'Fully Vaccinated',    'full': 'Fully Vaccinated',    'fully': 'Fully Vaccinated',
  '2': 'Partially Vaccinated','partial': 'Partially Vaccinated', 'partially': 'Partially Vaccinated',
  '3': 'Not Vaccinated',      'not': 'Not Vaccinated',       'none': 'Not Vaccinated',
};

function parseVaccination(text) {
  const key = text.trim().toLowerCase();
  return VACCINATION_MAP[key] || null;
}

/* ── ASHA text message router ────────────────────────────────── */

bot.on('message', (msg) => {
  // Only handle text messages here; location/photo are handled elsewhere
  if (!msg.text || msg.location || msg.photo) return;
  const chatId = msg.chat.id;
  const state  = getState(chatId);
  const text   = msg.text.trim();

  /* ════════════════════════════════════════════════════════════
     ASHA MODE ROUTING
     ════════════════════════════════════════════════════════════ */
  if (state.mode === 'asha') {
    // Global EXIT is already handled by onText, but guard here too
    if (/^EXIT$/i.test(text) || /^ASHA$/i.test(text)) return;

    switch (state.step) {

      /* ── Step 0a: Waiting for ASHA ID ──────────────────── */
      case 'asha_awaiting_id': {
        const ashaId = text.replace(/[^A-Za-z0-9\-_]/g, '').toUpperCase();
        if (ashaId.length < 2) {
          sendMD(chatId, '⚠️ Please enter a valid ASHA Worker ID.');
          return;
        }
        setState(chatId, 'asha_awaiting_name', { ashaId });
        sendMD(chatId,
          `✅ ID recorded: *${ashaId}*

Now enter your *full name*:`
        );
        return;
      }

      /* ── Step 0b: Waiting for ASHA name ────────────────── */
      case 'asha_awaiting_name': {
        const name = text.trim();
        if (name.length < 2) {
          sendMD(chatId, '⚠️ Please enter your full name.');
          return;
        }
        setState(chatId, 'asha_household', { name });
        sendMD(chatId,
          `👋 Welcome, *${name}*!

─────────────────────────────
🏠 *Step 1 of 6 — Household Info*

Enter the *Household ID or address* you are visiting:`
        );
        return;
      }

      /* ── Step 1: Household ──────────────────────────────── */
      case 'asha_household': {
        const householdId = text.trim();
        if (!householdId) {
          sendMD(chatId, '⚠️ Please enter a Household ID or address.');
          return;
        }
        setState(chatId, 'asha_location', { householdId });
        sendMD(chatId,
          `🏠 *Household:* ${householdId}

─────────────────────────────
📍 *Step 2 of 6 — Location*

*Share the household GPS location* so we can map it to the correct ward.

_Tap 📎 → Location → Share My Location_`
        );
        return;
      }

      /* ── Step 2: Location (handled in bot.on('location')) ─ */
      case 'asha_location': {
        sendMD(chatId,
          `📍 Please *share your GPS location* (tap 📎 → Location).
_Text input is not accepted for this step._`
        );
        return;
      }

      /* ── Step 3: Symptoms ───────────────────────────────── */
      case 'asha_symptoms': {
        const symptoms = parseSymptoms(text);
        if (!symptoms) {
          sendMD(chatId,
            `⚠️ Couldn't recognise that. Please enter numbers or names:
1️⃣ Fever  2️⃣ Cough  3️⃣ Joint Pain
4️⃣ Diarrhoea  5️⃣ Skin Rash  6️⃣ None

_Example: 1,3  or  Fever, Cough_`
          );
          return;
        }
        setState(chatId, 'asha_sanitation', { symptoms });
        sendMD(chatId,
          `🤒 *Symptoms:* ${symptoms.join(', ')}

─────────────────────────────
🧹 *Step 4 of 6 — Sanitation*

What are the sanitation conditions at this household?

1️⃣  Clean
2️⃣  Stagnant Water Nearby
3️⃣  Garbage Nearby
4️⃣  Open Drain Nearby

_Type the number or keyword_`
        );
        return;
      }

      /* ── Step 4: Sanitation ─────────────────────────────── */
      case 'asha_sanitation': {
        const sanitation = parseSanitation(text);
        if (!sanitation) {
          sendMD(chatId,
            `⚠️ Please enter a valid option:
1️⃣ Clean  2️⃣ Stagnant Water  3️⃣ Garbage Nearby  4️⃣ Open Drain`
          );
          return;
        }
        setState(chatId, 'asha_vaccination', { sanitation });
        sendMD(chatId,
          `🧹 *Sanitation:* ${sanitation}

─────────────────────────────
💉 *Step 5 of 6 — Vaccination Status*

1️⃣  Fully Vaccinated
2️⃣  Partially Vaccinated
3️⃣  Not Vaccinated

_Type the number or keyword_`
        );
        return;
      }

      /* ── Step 5: Vaccination ────────────────────────────── */
      case 'asha_vaccination': {
        const vaccination = parseVaccination(text);
        if (!vaccination) {
          sendMD(chatId,
            `⚠️ Please enter: 1 (Fully Vaccinated), 2 (Partially), or 3 (Not Vaccinated).`
          );
          return;
        }
        setState(chatId, 'asha_notes', { vaccination });
        sendMD(chatId,
          `💉 *Vaccination:* ${vaccination}

─────────────────────────────
📝 *Step 6 of 6 — Notes*

Any additional observations? (or type \`skip\`)`
        );
        return;
      }

      /* ── Step 6: Notes → Submit ─────────────────────────── */
      case 'asha_notes': {
        const notes = /^skip$/i.test(text) ? null : text.trim();
        const d = state.data;
        const ward = d.ward || 'Sector-01';
        const ts   = new Date().toISOString();

        const survey = {
          ashaId:     d.ashaId,
          name:       d.name,
          householdId: d.householdId,
          location:   d.location || null,
          ward,
          symptoms:   d.symptoms,
          sanitation: d.sanitation,
          vaccination: d.vaccination,
          notes,
          source:     'asha_telegram',
          timestamp:  ts,
        };

        // Persist survey
        saveAshaSurvey(survey);

        // Also write to telegram_reports so Digital Twin community layer shows it
        saveReport({
          type:         'asha_survey',
          source:       'asha_telegram',
          issue_type:   `ASHA Survey — ${d.symptoms.join(', ')}`,
          sector:       ward,
          latitude:     d.location?.lat,
          longitude:    d.location?.lng,
          location:     d.location,
          has_proof:    false,
          note:         `ASHA ${d.ashaId} | ${d.name} | Sanitation: ${d.sanitation} | Vacc: ${d.vaccination}`,
          timestamp:    ts,
        });

        // Update ward risk signals
        const hasRiskySymptoms = d.symptoms.some(s => s !== 'None');
        const hasRiskySanitation = d.sanitation !== 'Clean';
        if (hasRiskySymptoms)    increaseDiseaseBurden(ward);
        if (hasRiskySanitation)  increaseSanitationStress(ward);

        // Increment survey count
        ensureWardEntry(ward);
        wardSignals[ward].surveys = (wardSignals[ward].surveys || 0) + 1;
        saveWardSignals(wardSignals);

        // Reset to ASHA idle (ready for next household)
        setMode(chatId, 'asha', 'asha_household', { ashaId: d.ashaId, name: d.name });

        // Risk label
        const riskLabel =
          hasRiskySymptoms && hasRiskySanitation ? '🔴 HIGH — Dual risk signal flagged' :
          hasRiskySymptoms                         ? '🟠 ELEVATED — Symptoms reported' :
          hasRiskySanitation                       ? '🟡 MODERATE — Sanitation concern' :
                                                     '🟢 LOW — No major signals';

        sendMD(chatId,
          `✅ *Survey Submitted Successfully*
─────────────────────────────
📍 *Ward:* ${ward}
🏠 *Household:* ${d.householdId}
🤒 *Symptoms:* ${d.symptoms.join(', ')}
🧹 *Sanitation:* ${d.sanitation}
💉 *Vaccination:* ${d.vaccination}
${notes ? `📝 *Notes:* ${notes}` : ''}

🚨 *Risk Level:* ${riskLabel}
📊 Risk signals → Digital Twin updated

─────────────────────────────
🏠 *Ready for next household.*
Enter the next Household ID, or type \`EXIT\` to quit.`
        );
        return;
      }

      default:
        sendMD(chatId, `⚠️ Unexpected state. Type \`EXIT\` and \`ASHA\` to restart.`);
        return;
    }
  }

  /* ════════════════════════════════════════════════════════════
     CITIZEN CATCH-ALL
     ════════════════════════════════════════════════════════════ */
  if (state.step !== 'idle') return; // Don't interrupt active citizen flows

  // Skip if text would be handled by any onText handler (same patterns, no anchors)
  const alreadyHandled =
    /^\/start$/i.test(text) ||
    /^\/mychatid$/i.test(text) ||
    /^ASHA$/i.test(text) ||
    /^EXIT$/i.test(text) ||
    /^(hi|hello|hey|namaste|hii|helo)$/i.test(text) ||
    /^\/help|help/i.test(text) ||
    /report|sanitation|garbage|drain|toilet|bin/i.test(text) ||
    /fever|pain|headache|symptoms|sick|unwell|nausea|cough/i.test(text) ||
    /passport|health card|healthcard/i.test(text);
  if (alreadyHandled) return;

  sendMD(chatId,
    `I didn't catch that. Try:\n• \`report\` — sanitation issue\n• \`fever\` — health symptom\n• \`passport\` — health passport\n• \`ASHA\` — field worker mode\n• \`help\` — all commands`
  );
});

/* ─── API SERVER FOR SENDING ADVISORIES ─────────────────────── */

const apiApp = express();
apiApp.use(express.json());
apiApp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// POST /api/send-advisory - Broadcast advisory to all known chats
apiApp.post('/api/send-advisory', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  const chats = loadKnownChats();
  if (chats.length === 0) {
    return res.status(404).json({ error: 'No known chat IDs. Send /start or /mychatid to the bot first.' });
  }

  try {
    await Promise.all(chats.map(id => bot.sendMessage(id, message, { parse_mode: 'Markdown' })));
    console.log(`📤 Advisory broadcast to ${chats.length} chat(s): ${chats.join(', ')}`);
    res.json({ success: true, message: `Sent to ${chats.length} chat(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/test-advisory - Test endpoint with hardcoded chat
apiApp.get('/api/test-advisory', (req, res) => {
  const testChatId = process.env.TEST_CHAT_ID || '1776158913104'; // Replace with your test chat ID
  const testMessage = req.query.message || '🚨 *Test Advisory*\n\nThis is a test message from the Urbanome app!';

  try {
    bot.sendMessage(testChatId, testMessage, { parse_mode: 'Markdown' });
    res.json({ success: true, message: `Test advisory sent to ${testChatId}` });
    console.log(`📤 Test advisory sent to ${testChatId}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const API_PORT = 3001;
apiApp.listen(API_PORT, () => {
  console.log(`📡 Advisory API running on http://localhost:${API_PORT}`);
});

/* ─── START ──────────────────────────────────────────────────── */

console.log('');
console.log('🤖  Aheadly Telegram Bot started — polling for messages...');
console.log(`📁  Citizen reports : ${REPORTS_FILE}`);
console.log(`📁  ASHA surveys    : ${ASHA_SURVEYS_FILE}`);
console.log(`📁  ASHA signals    : ${ASHA_SIGNALS_FILE}`);
console.log('');
