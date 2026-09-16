// One-time build tool: turns real geographic boundaries + the real Telangana
// NIC ATM dataset into the fixture files the frontend reads from /public/data.
//
// Real, not invented:
//   - Telangana state outline (udit-001/india-maps-data)
//   - Telangana district polygons (geoBoundaries ADM2, LGD-sourced)
//   - GHMC ward polygons for Hyderabad area drill-down (OSM via datameet)
//   - Every ATM bank/name/lat/lon/district (telangana_nic_atm_9642.csv)
//
// Simulated, deterministic (seeded by id, never Math.random on render):
//   - risk scores/levels, predictions, cases, alerts, actions, audit, paths
//
// Run with: npm run prepare-data

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as turf from '@turf/turf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const CSV_PATH = path.join(ROOT, 'telangana_nic_atm_9642 (1).csv');

const STATE_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/telangana.geojson';
const ADM2_GEOJSON_URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/IND/ADM2/geoBoundaries-IND-ADM2_simplified.geojson';
const GHMC_WARDS_URL =
  'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Hyderabad/ghmc-wards.geojson';

fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Deterministic PRNG — seeded by string id, stable across builds and reloads.
// ---------------------------------------------------------------------------
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandom(id) {
  return mulberry32(hashString(id));
}

function riskLevelFromScore(score) {
  if (score >= 0.85) return 'CRITICAL';
  if (score >= 0.65) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Step 1: fetch real geographic boundaries
// ---------------------------------------------------------------------------
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}

console.log('Fetching real Telangana state boundary...');
const stateGeojson = await fetchJson(STATE_GEOJSON_URL);

console.log('Fetching real India district (ADM2) boundaries...');
const adm2 = await fetchJson(ADM2_GEOJSON_URL);

console.log('Fetching real GHMC ward boundaries...');
const ghmcWards = await fetchJson(GHMC_WARDS_URL);

// CSV district name -> geoBoundaries ADM2 shapeName (spelling/naming variants
// only; these are the same real polygons, just reconciling two independent
// real-world naming sources).
const DISTRICT_NAME_TO_SHAPE = {
  'Adilabad': 'Adilabad',
  'Bhadradri Kothagudem': 'Bhadradri',
  'Hanumakonda': 'Warangal (U)',
  'Hyderabad': 'Hydrabad',
  'Jagitial': 'Jagtial',
  'Jangoan': 'Jangaon',
  'Jayashankar': 'Jayashankar',
  'Jogulamba Gadwal': 'Jogulamba',
  'Kamareddy': 'Kamareddy',
  'Karimnagar': 'Karimnagar',
  'Khammam': 'Khammam',
  'Kumuram Bheem Asifabad': 'Komaram Bheem',
  'Mahabubabad': 'Mahabubabad',
  'Mahabubnagar': 'Mahabubnagar',
  'Mancherial': 'Mancherial',
  'Medak': 'Medak',
  'Medchal Malkajgiri': 'Medchal',
  'Mulugu': 'Mulugu',
  'Nagarkurnool': 'Nagarkurnool',
  'Nalgonda': 'Nalgonda',
  'Narayanpet': 'Narayanpet',
  'Nirmal': 'Nirmal',
  'Nizamabad': 'Nizamabad',
  'Peddapalli': 'Peddapalli',
  'Rajanna Sircilla': 'Rajanna Sircilla',
  'Ranga Reddy': 'Rangareddy',
  'Sangareddy': 'Sangareddy',
  'Siddipet': 'Siddipet',
  'Suryapet': 'Suryapet',
  'Vikarabad': 'Vikarabad',
  'Wanaparthy': 'Wanaparthy',
  'Warangal': 'Warangal (R)',
  'Yadadri Bhuvanagiri': 'Yadadri Bhongiri',
};

function slugId(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const shapeNameToFeature = new Map();
for (const f of adm2.features) shapeNameToFeature.set(f.properties.shapeName, f);

const districtFeatures = [];
for (const [districtName, shapeName] of Object.entries(DISTRICT_NAME_TO_SHAPE)) {
  const feature = shapeNameToFeature.get(shapeName);
  if (!feature) {
    console.warn(`  ! No boundary match for ${districtName} (${shapeName})`);
    continue;
  }
  const districtId = `D-${slugId(districtName)}`;
  districtFeatures.push(
    turf.feature(feature.geometry, {
      district_id: districtId,
      district_name: districtName,
    }),
  );
}
console.log(`Matched ${districtFeatures.length}/33 real district polygons.`);

// ---------------------------------------------------------------------------
// Step 2: parse the real ATM CSV (handles quoted fields with embedded commas)
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

console.log('Parsing real ATM dataset...');
const csvRaw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
const csvRows = parseCsv(csvRaw);
const header = csvRows[0].map((h) => h.trim().toLowerCase());
const col = (name) => header.indexOf(name);

const idx = {
  bank_name: col('bank_name'),
  atm_cd: col('atm_cd'),
  atm_lat: col('atm_lat'),
  atm_long: col('atm_long'),
  dtname: col('dtname'),
  atm_city: col('atm_city'),
  atm_pin_cd: col('atm_pin_cd'),
};

const rawAtms = [];
for (let i = 1; i < csvRows.length; i++) {
  const r = csvRows[i];
  if (!r || r.length < 4) continue;
  const lat = parseFloat(r[idx.atm_lat]);
  const lon = parseFloat(r[idx.atm_long]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  if (lat < 15.5 || lat > 20.5 || lon < 77.0 || lon > 82.0) continue;
  rawAtms.push({
    bank_name: (r[idx.bank_name] || '').trim(),
    atm_cd: (r[idx.atm_cd] || '').trim(),
    lat,
    lon,
    dtname: (r[idx.dtname] || '').trim(),
    atm_city: (r[idx.atm_city] || '').trim(),
    atm_pin_cd: (r[idx.atm_pin_cd] || '').trim(),
  });
}
console.log(`Parsed ${rawAtms.length} valid real ATM records.`);

// De-duplicate by atm_cd, keeping first occurrence (CSV has some dup codes).
const seenCodes = new Set();
const atmsDeduped = [];
for (const a of rawAtms) {
  const key = a.atm_cd || `${a.lat},${a.lon}`;
  if (seenCodes.has(key)) continue;
  seenCodes.add(key);
  atmsDeduped.push(a);
}
console.log(`${atmsDeduped.length} unique ATMs after de-duplication.`);

// ---------------------------------------------------------------------------
// Step 3: spatial join — assign each real ATM point to a real district
// polygon (point-in-polygon), falling back to the CSV's own district label
// when a point falls just outside a simplified polygon boundary.
// ---------------------------------------------------------------------------
function findDistrictForPoint(lon, lat) {
  const pt = turf.point([lon, lat]);
  for (const feature of districtFeatures) {
    try {
      if (turf.booleanPointInPolygon(pt, feature)) return feature.properties;
    } catch {
      /* ignore malformed ring, fall through to CSV fallback */
    }
  }
  return null;
}

const districtByName = new Map(
  districtFeatures.map((f) => [f.properties.district_name, f.properties]),
);

const ghmcWardFeatures = ghmcWards.features.map((f) =>
  turf.feature(f.geometry, { area_name: f.properties.name }),
);

function findWardForPoint(lon, lat) {
  const pt = turf.point([lon, lat]);
  for (const feature of ghmcWardFeatures) {
    try {
      if (turf.booleanPointInPolygon(pt, feature)) return feature.properties.area_name;
    } catch {
      /* ignore */
    }
  }
  return null;
}

const atms = atmsDeduped.map((a) => {
  const spatialDistrict = findDistrictForPoint(a.lon, a.lat);
  const district = spatialDistrict || districtByName.get(a.dtname) || null;
  const districtId = district?.district_id ?? 'D-UNK';
  const districtName = district?.district_name ?? a.dtname ?? 'Unknown';
  const wardName = findWardForPoint(a.lon, a.lat);
  const atmId = `ATM-${slugId(districtName)}-${(a.atm_cd || `${a.lat}${a.lon}`).replace(/[^A-Za-z0-9]/g, '').slice(-5).padStart(5, '0')}`;
  return {
    atm_id: atmId,
    bank_name: a.bank_name || 'Unknown Bank',
    lat: a.lat,
    lon: a.lon,
    district_id: districtId,
    district_name: districtName,
    area_name: wardName,
    atm_city: a.atm_city,
    atm_pin_cd: a.atm_pin_cd,
  };
});

// ---------------------------------------------------------------------------
// Step 4: deterministic risk scoring per ATM, then aggregate per district/area
// ---------------------------------------------------------------------------
const BANK_IDS = new Map();
function bankId(bankName) {
  if (!BANK_IDS.has(bankName)) {
    BANK_IDS.set(bankName, `BANK-${String(BANK_IDS.size + 1).padStart(3, '0')}`);
  }
  return BANK_IDS.get(bankName);
}

for (const atm of atms) {
  const rand = seededRandom(atm.atm_id);
  // Deterministic composite score: mostly seeded noise, nudged by ward
  // presence (urban core ATMs skew slightly higher in this simulation).
  const base = rand();
  const urbanNudge = atm.area_name ? 0.08 : 0;
  const score = Math.min(0.99, Math.round((base * 0.85 + urbanNudge) * 100) / 100);
  atm.risk_score = score;
  atm.risk_level = riskLevelFromScore(score);
  atm.bank_id = bankId(atm.bank_name);
}

// Rank within district
const byDistrict = new Map();
for (const atm of atms) {
  if (!byDistrict.has(atm.district_id)) byDistrict.set(atm.district_id, []);
  byDistrict.get(atm.district_id).push(atm);
}
for (const [, list] of byDistrict) {
  list.sort((a, b) => b.risk_score - a.risk_score);
  list.forEach((atm, i) => (atm.rank_in_district = i + 1));
}

const HIGHLIGHT_THRESHOLD = 5;
const districtRiskById = new Map();
for (const feature of districtFeatures) {
  const { district_id, district_name } = feature.properties;
  const list = byDistrict.get(district_id) || [];
  const highRisk = list.filter((a) => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL');
  const rand = seededRandom(district_id);
  const density = Math.min(1, list.length / 400);
  const avgTopRisk =
    list.slice(0, 10).reduce((s, a) => s + a.risk_score, 0) / Math.max(1, Math.min(10, list.length));
  const score = list.length
    ? Math.round(Math.min(0.97, avgTopRisk * 0.6 + density * 0.25 + rand() * 0.15) * 100) / 100
    : Math.round(rand() * 0.3 * 100) / 100;
  districtRiskById.set(district_id, {
    district_id,
    district_name,
    risk_level: riskLevelFromScore(score),
    risk_score: score,
    atm_total: list.length,
    high_risk_atm_count: highRisk.length,
    highlight_threshold: HIGHLIGHT_THRESHOLD,
    district_highlight: highRisk.length > HIGHLIGHT_THRESHOLD,
    geometry: feature.geometry,
  });
}

// Area (GHMC ward) aggregation — only wards that actually contain an ATM.
const byWard = new Map();
for (const atm of atms) {
  if (!atm.area_name) continue;
  if (!byWard.has(atm.area_name)) byWard.set(atm.area_name, []);
  byWard.get(atm.area_name).push(atm);
}
const wardFeatureByName = new Map(ghmcWardFeatures.map((f) => [f.properties.area_name, f]));
const areaFeatures = [];
for (const [wardName, list] of byWard) {
  const feature = wardFeatureByName.get(wardName);
  if (!feature) continue;
  const areaId = `A-${slugId(wardName)}`;
  const rand = seededRandom(areaId);
  const highRisk = list.filter((a) => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL');
  const avgRisk = list.reduce((s, a) => s + a.risk_score, 0) / list.length;
  const score = Math.round(Math.min(0.97, avgRisk * 0.75 + rand() * 0.2) * 100) / 100;
  // Majority district among this ward's real ATM points (a ward can straddle
  // a district boundary in the underlying polygons).
  const districtCounts = new Map();
  for (const a of list) districtCounts.set(a.district_id, (districtCounts.get(a.district_id) || 0) + 1);
  const wardDistrictId = [...districtCounts.entries()].sort((x, y) => y[1] - x[1])[0][0];
  areaFeatures.push({
    area_id: areaId,
    area_name: wardName,
    district_id: wardDistrictId,
    risk_score: score,
    risk_level: riskLevelFromScore(score),
    high_risk_atm_count: highRisk.length,
    geometry: feature.geometry,
    atm_ids: list.map((a) => a.atm_id),
  });
  for (const a of list) {
    const areaSlug = areaId;
    a.area_id = areaSlug;
  }
}
for (const atm of atms) {
  if (!atm.area_id) atm.area_id = null;
}

console.log(`Computed risk for ${atms.length} ATMs across ${byDistrict.size} districts and ${areaFeatures.length} GHMC wards.`);

// ---------------------------------------------------------------------------
// Step 5: pick the flagship "golden path" ATM (highest risk, inside a named
// ward, so the district -> area -> ATM drill-down has real substance) and a
// supporting set of high-risk ATMs for prediction/alert fixtures.
// ---------------------------------------------------------------------------
const candidateAtms = atms
  .filter((a) => a.area_name && a.risk_level === 'CRITICAL')
  .sort((a, b) => b.risk_score - a.risk_score);
const flagship = candidateAtms[0] || atms.filter((a) => a.area_name)[0];

const otherHighRisk = atms
  .filter((a) => a.atm_id !== flagship.atm_id && (a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH'))
  .sort((a, b) => b.risk_score - a.risk_score);

// Spread additional flagged ATMs across distinct districts for a realistic
// state-wide alert queue instead of clustering them all in one place.
const perDistrictPicks = [];
const usedDistricts = new Set([flagship.district_id]);
for (const a of otherHighRisk) {
  if (perDistrictPicks.length >= 11) break;
  if (usedDistricts.has(a.district_id)) continue;
  usedDistricts.add(a.district_id);
  perDistrictPicks.push(a);
}
const flaggedAtms = [flagship, ...perDistrictPicks];

// ---------------------------------------------------------------------------
// Step 6: build cases / predictions / paths / alerts / actions / audit /
// notifications / withdrawal history, deterministically, around those ATMs.
// ---------------------------------------------------------------------------
const NOW = new Date('2026-09-16T13:32:18+05:30');
function isoIst(date) {
  // Store times as IST offset strings per the contract examples.
  // date.getTime() is already a timezone-independent UTC epoch; shifting it
  // by +5:30 and reading UTC fields yields IST wall-clock components.
  const ist = new Date(date.getTime() + 5.5 * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}T${pad(
    ist.getUTCHours(),
  )}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}+05:30`;
}

const CRIME_CATEGORIES = [
  'CYBER_FINANCIAL_FRAUD',
  'UPI_FRAUD',
  'ONLINE_BANKING_FRAUD',
  'INVESTMENT_SCAM',
  'PHISHING',
];

const VICTIM_NAMES = [
  'R. Kumar', 'S. Reddy', 'A. Sharma', 'P. Rao', 'M. Iyer', 'V. Naidu',
  'K. Prasad', 'D. Varma', 'N. Chandra', 'J. Rao', 'L. Shetty', 'T. Menon',
];

const cases = [];
const predictions = [];
const paths = [];
const alerts = [];
const actions = [];
const audit = [];
const notifications = [];
const withdrawalsByAtm = new Map();

let caseSeq = 10480;
let predSeq = 90020;
let alertSeq = 20480;
let actionSeq = 7710;
let outcomeSeq = 1190;
let auditSeq = 501990;
let notifSeq = 0;
let withdrawalSeq = 889200;

function nextCaseId() {
  caseSeq += 1;
  return `C-${caseSeq}`;
}
function nextPredId() {
  predSeq += 1;
  return `PRED-${predSeq}`;
}
function nextAlertId() {
  alertSeq += 1;
  return `AL-${alertSeq}`;
}
function nextActionId() {
  actionSeq += 1;
  return `ACT-${actionSeq}`;
}
function nextOutcomeId() {
  outcomeSeq += 1;
  return `OUT-${outcomeSeq}`;
}
function nextAuditId() {
  auditSeq += 1;
  return `AUD-${auditSeq}`;
}
function nextNotifId() {
  notifSeq += 1;
  return `NOTIF-${String(notifSeq).padStart(4, '0')}`;
}

const ALERT_LIFECYCLE_PLAN = [
  'ACTION_INITIATED', // flagship: full golden path, still open
  'ACKNOWLEDGED',
  'ASSIGNED',
  'DELIVERED',
  'GENERATED',
  'RESOLVED',
  'DELIVERED',
  'ACKNOWLEDGED',
  'ACTION_INITIATED',
  'DELIVERED',
  'EXPIRED',
  'DELIVERED',
];

flaggedAtms.forEach((atm, i) => {
  const rand = seededRandom(`case-${atm.atm_id}`);
  const caseId = nextCaseId();
  const predId = nextPredId();
  const alertId = nextAlertId();
  const isFlagship = i === 0;
  const reportedAmount = Math.round((20000 + rand() * 180000) / 1000) * 1000;
  const victim = VICTIM_NAMES[i % VICTIM_NAMES.length];
  const bank = atm.bank_name;
  const reportOffsetMin = 40 + Math.round(rand() * 240);
  const reportTime = new Date(NOW.getTime() - reportOffsetMin * 60000);

  const windowStartOffsetMin = isFlagship ? 28 : Math.round(rand() * 90) - 20;
  const windowStart = new Date(NOW.getTime() + windowStartOffsetMin * 60000);
  const windowEnd = new Date(windowStart.getTime() + 2 * 3600000);

  const leaUnitId = `LEA-TG-${slugId(atm.district_name)}-01`;
  const caseObj = {
    case_id: caseId,
    complaint_id: `NCRP-DEMO-${caseId.split('-')[1]}`,
    created_at: isoIst(reportTime),
    status: isFlagship ? 'ACTION_INITIATED' : (['UNDER_INVESTIGATION', 'FINANCIAL_INTELLIGENCE_PROCESSING', 'RESOLVED'][i % 3]),
    crime_category: CRIME_CATEGORIES[i % CRIME_CATEGORIES.length],
    reported_amount: reportedAmount,
    reporting_timestamp: isoIst(reportTime),
    victim: {
      display_name: `Masked Victim (${victim})`,
      contact_masked: `+91-******${String(100 + i).padStart(3, '0')}`,
    },
    known_financial_context: {
      victim_account_masked: `XXXXXX${1000 + hashString(caseId) % 9000}`,
      bank_name: bank,
    },
    assigned_lea: {
      unit_id: leaUnitId,
      unit_name: `${atm.district_name} Cybercrime Unit`,
    },
  };
  cases.push(caseObj);

  const supportingPaths = 3 + Math.round(rand() * 6);
  const convergingPaths = Math.max(1, Math.round(supportingPaths * (0.4 + rand() * 0.4)));
  const lastTxAmount = Math.round((reportedAmount * (0.5 + rand() * 0.4)) / 1000) * 1000;
  const freshnessSeconds = Math.round(60 + rand() * 900);

  const predObj = {
    prediction_id: predId,
    case_id: caseId,
    status: caseObj.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
    as_of: isoIst(new Date(NOW.getTime() - freshnessSeconds * 1000)),
    generated_at: isoIst(NOW),
    risk: {
      score: atm.risk_score,
      level: atm.risk_level,
      rank: atm.rank_in_district,
    },
    predicted_cashout: {
      location_type: 'ATM',
      atm_id: atm.atm_id,
      district_id: atm.district_id,
      district_name: atm.district_name,
      area_id: atm.area_id,
      area_name: atm.area_name,
      lat: atm.lat,
      lon: atm.lon,
      withdrawal_window: { start: isoIst(windowStart), end: isoIst(windowEnd) },
    },
    supporting_intelligence: {
      supporting_path_count: supportingPaths,
      converging_path_count: convergingPaths,
      last_observed_transaction: { timestamp: isoIst(reportTime), amount: lastTxAmount },
      explanation_factors: [
        { label: 'Multiple predicted paths converge', value: convergingPaths },
        { label: 'Recent transaction activity', value: rand() > 0.4 ? 'HIGH' : 'MEDIUM' },
        { label: 'Historical cash-out similarity', value: rand() > 0.5 ? 'HIGH' : 'MEDIUM' },
        { label: 'ATM density in area', value: atm.area_name ? 'HIGH' : 'MEDIUM' },
      ],
    },
    freshness_seconds: freshnessSeconds,
  };
  predictions.push(predObj);

  // Fund-flow path: victim -> intermediate A -> intermediate B -> ATM
  const t0 = new Date(reportTime.getTime() - 50 * 60000);
  const t1 = new Date(t0.getTime() + 19 * 60000);
  const amt0 = Math.round((reportedAmount * (0.8 + rand() * 0.2)) / 1000) * 1000;
  const amt1 = Math.round((amt0 * (0.75 + rand() * 0.2)) / 1000) * 1000;
  paths.push({
    prediction_id: predId,
    path_id: `PATH-${String(i + 1).padStart(2, '0')}`,
    path_probability: Math.round((0.55 + rand() * 0.4) * 100) / 100,
    nodes: [
      { sequence: 1, node_type: 'VICTIM_ACCOUNT', node_id: `MASKED-V-${String(i + 1).padStart(3, '0')}`, label: 'Victim Account' },
      { sequence: 2, node_type: 'ACCOUNT', node_id: `MASKED-A-${String(19 + i).padStart(3, '0')}`, label: 'Intermediate Account A' },
      { sequence: 3, node_type: 'ACCOUNT', node_id: `MASKED-A-${String(44 + i).padStart(3, '0')}`, label: 'Intermediate Account B' },
      { sequence: 4, node_type: 'ATM', node_id: atm.atm_id, label: 'Predicted ATM', lat: atm.lat, lon: atm.lon },
    ],
    edges: [
      { from: `MASKED-V-${String(i + 1).padStart(3, '0')}`, to: `MASKED-A-${String(19 + i).padStart(3, '0')}`, timestamp: isoIst(t0), amount: amt0 },
      { from: `MASKED-A-${String(19 + i).padStart(3, '0')}`, to: `MASKED-A-${String(44 + i).padStart(3, '0')}`, timestamp: isoIst(t1), amount: amt1 },
      { from: `MASKED-A-${String(44 + i).padStart(3, '0')}`, to: atm.atm_id, predicted: true },
    ],
  });

  // Alert with lifecycle-appropriate recipient statuses
  const lifecycleStatus = ALERT_LIFECYCLE_PLAN[i % ALERT_LIFECYCLE_PLAN.length];
  const leaRecipientStatus = ['GENERATED'].includes(lifecycleStatus) ? 'DELIVERED' : 'ACKNOWLEDGED';
  const bankRecipientStatus = ['GENERATED', 'DELIVERED'].includes(lifecycleStatus) ? 'DELIVERED' : 'ACKNOWLEDGED';
  const alertObj = {
    alert_id: alertId,
    alert_type: 'PREDICTED_CASHOUT',
    severity: atm.risk_level,
    status: lifecycleStatus,
    created_at: isoIst(new Date(NOW.getTime() - freshnessSeconds * 1000)),
    expires_at: isoIst(windowEnd),
    case_id: caseId,
    prediction_id: predId,
    target: {
      atm_id: atm.atm_id,
      district: atm.district_name,
      area: atm.area_name,
    },
    predicted_window: { start: isoIst(windowStart), end: isoIst(windowEnd) },
    recipients: [
      { type: 'LEA', id: leaUnitId, status: leaRecipientStatus },
      { type: 'BANK', id: atm.bank_id, status: bankRecipientStatus },
      { type: 'I4C', id: 'I4C-TG-01', status: 'VISIBLE' },
    ],
  };
  alerts.push(alertObj);

  audit.push({
    event_id: nextAuditId(),
    timestamp: alertObj.created_at,
    actor_role: 'I4C',
    actor_display: 'System',
    event_type: 'ALERT_GENERATED',
    entity_type: 'ALERT',
    entity_id: alertId,
    summary: `Predicted cash-out alert generated for ${atm.district_name}${atm.area_name ? ' / ' + atm.area_name : ''}.`,
  });

  if (['ACKNOWLEDGED', 'ASSIGNED', 'ACTION_INITIATED', 'RESOLVED'].includes(lifecycleStatus)) {
    const ackTime = new Date(new Date(alertObj.created_at).getTime() + 6 * 60000);
    audit.push({
      event_id: nextAuditId(),
      timestamp: isoIst(ackTime),
      actor_role: 'LEA',
      actor_display: `${atm.district_name} Cybercrime Unit`,
      event_type: 'ALERT_ACKNOWLEDGED',
      entity_type: 'ALERT',
      entity_id: alertId,
      summary: 'Alert acknowledged by assigned LEA unit.',
    });
    notifications.push({
      notification_id: nextNotifId(),
      recipient_role: 'I4C',
      recipient_id: 'I4C-TG-01',
      created_at: isoIst(ackTime),
      read: !isFlagship,
      category: 'ACKNOWLEDGEMENT',
      title: 'Alert acknowledged',
      body: `${atm.district_name} LEA unit acknowledged alert ${alertId}.`,
      related_alert_id: alertId,
      related_case_id: caseId,
    });
  }

  if (['ASSIGNED', 'ACTION_INITIATED', 'RESOLVED'].includes(lifecycleStatus)) {
    const actionId = nextActionId();
    const actionTime = new Date(new Date(alertObj.created_at).getTime() + 12 * 60000);
    actions.push({
      action_id: actionId,
      alert_id: alertId,
      case_id: caseId,
      actor: { role: 'LEA', user_id: `OFFICER-${100 + i}` },
      action_type: 'FIELD_VERIFICATION_INITIATED',
      status: lifecycleStatus === 'RESOLVED' ? 'COMPLETED' : 'IN_PROGRESS',
      created_at: isoIst(actionTime),
      notes: 'Local unit assigned for verification.',
      next_review_at: isoIst(new Date(actionTime.getTime() + 75 * 60000)),
    });
    audit.push({
      event_id: nextAuditId(),
      timestamp: isoIst(actionTime),
      actor_role: 'LEA',
      actor_display: `Officer ${100 + i}`,
      event_type: 'ACTION_RECORDED',
      entity_type: 'ACTION',
      entity_id: actionId,
      summary: 'Field verification initiated by assigned officer.',
    });
  }

  if (lifecycleStatus === 'RESOLVED') {
    const outcomeTime = new Date(new Date(alertObj.created_at).getTime() + 90 * 60000);
    audit.push({
      event_id: nextAuditId(),
      timestamp: isoIst(outcomeTime),
      actor_role: 'LEA',
      actor_display: `Officer ${100 + i}`,
      event_type: 'OUTCOME_RECORDED',
      entity_type: 'ACTION',
      entity_id: nextOutcomeId(),
      summary: rand() > 0.3 ? 'Withdrawal observed at predicted location.' : 'Prediction window elapsed without confirmed withdrawal.',
    });
  }

  // Withdrawal history for this ATM
  const historyCount = 20 + Math.round(rand() * 25);
  const records = [];
  for (let w = 0; w < historyCount; w++) {
    const daysAgo = Math.round(rand() * 30);
    const ts = new Date(NOW.getTime() - daysAgo * 86400000 - Math.round(rand() * 80000) * 1000);
    records.push({
      withdrawal_id: `W-${++withdrawalSeq}`,
      timestamp: isoIst(ts),
      amount: Math.round((5000 + rand() * 35000) / 500) * 500,
      status: rand() > 0.92 ? 'FLAGGED' : 'COMPLETED',
      related_case_id: rand() > 0.85 ? caseId : undefined,
    });
  }
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  withdrawalsByAtm.set(atm.atm_id, {
    atm_id: atm.atm_id,
    withdrawal_history: {
      period: { from: isoIst(new Date(NOW.getTime() - 30 * 86400000)), to: isoIst(NOW) },
      summary: {
        withdrawal_count: records.length,
        total_amount: totalAmount,
        avg_amount: Math.round((totalAmount / records.length) * 100) / 100,
      },
      records,
    },
  });

  atm.active_prediction_count = 1;
  atm.related_case_count = 1 + Math.round(rand() * 6);
  atm.high_risk_path_count = supportingPaths;
  atm.predicted_withdrawal_window = { start: isoIst(windowStart), end: isoIst(windowEnd) };
});

console.log(`Built golden-path fixtures: ${cases.length} cases, ${predictions.length} predictions, ${alerts.length} alerts.`);

// ---------------------------------------------------------------------------
// Step 7: write output files
// ---------------------------------------------------------------------------
function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2));
  console.log(`  wrote public/data/${name}`);
}

function normalizeToSingleFeature(input, name) {
  const geometry =
    input.type === 'FeatureCollection'
      ? input.features[0].geometry
      : input.type === 'Feature'
        ? input.geometry
        : input;
  return turf.feature(geometry, { name });
}

writeJson('state.geojson', {
  type: 'FeatureCollection',
  features: [normalizeToSingleFeature(stateGeojson, 'Telangana')],
});

writeJson('districts.geojson', {
  type: 'FeatureCollection',
  features: [...districtRiskById.values()].map((d) =>
    turf.feature(d.geometry, {
      district_id: d.district_id,
      district_name: d.district_name,
      risk_level: d.risk_level,
      risk_score: d.risk_score,
      atm_total: d.atm_total,
      high_risk_atm_count: d.high_risk_atm_count,
      highlight_threshold: d.highlight_threshold,
      district_highlight: d.district_highlight,
    }),
  ),
});

writeJson('areas.geojson', {
  type: 'FeatureCollection',
  features: areaFeatures.map((a) =>
    turf.feature(a.geometry, {
      area_id: a.area_id,
      area_name: a.area_name,
      district_id: a.district_id,
      risk_score: a.risk_score,
      risk_level: a.risk_level,
      high_risk_atm_count: a.high_risk_atm_count,
      atm_ids: a.atm_ids,
    }),
  ),
});

writeJson(
  'atms.json',
  atms.map((a) => ({
    atm_id: a.atm_id,
    name: `${a.bank_name} — ${a.area_name || a.atm_city || a.district_name}`,
    bank_name: a.bank_name,
    bank_id: a.bank_id,
    lat: a.lat,
    lon: a.lon,
    address: [a.atm_city, a.area_name, a.district_name].filter(Boolean).join(', '),
    district_id: a.district_id,
    district_name: a.district_name,
    area_id: a.area_id,
    area_name: a.area_name,
    risk: {
      risk_score: a.risk_score,
      risk_level: a.risk_level,
      rank_in_district: a.rank_in_district,
      ...(a.predicted_withdrawal_window ? { predicted_withdrawal_window: a.predicted_withdrawal_window } : {}),
    },
    map_links: {
      google_maps: `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lon}`,
    },
    related: {
      active_prediction_count: a.active_prediction_count || 0,
      related_case_count: a.related_case_count || 0,
      high_risk_path_count: a.high_risk_path_count || 0,
    },
  })),
);

writeJson('cases.json', cases);
writeJson('predictions.json', predictions);
writeJson('paths.json', paths);
writeJson('alerts.json', alerts);
writeJson('actions.json', actions);
writeJson('audit.json', audit.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
writeJson('notifications.json', notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
writeJson('withdrawals.json', [...withdrawalsByAtm.values()]);
writeJson('flagship.json', {
  case_id: cases[0].case_id,
  prediction_id: predictions[0].prediction_id,
  alert_id: alerts[0].alert_id,
  atm_id: flagship.atm_id,
  district_id: flagship.district_id,
  area_id: flagship.area_id,
});

console.log('\nData preparation complete.');
