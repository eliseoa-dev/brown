// ── FORMICARIUM palette ──────────────────────────────────────────────────
// Every colour carries hex-alpha where it sits as a fill, in the spirit of
// Dilum Sanjaya's translucent, equation-driven surfaces.
export const COLORS = {
  bg: '#1a1208',
  bgDeep: '#0a0704',
  soilTop: '#1a3a0a',
  amber: '#f5a623',
  amberFill: '#f5a62388',
  amberLabel: '#d4820a99',
  amberSoft: '#d4820a',
  fungal: '#64958f',
  fungalFill: '#64958f88',
  queenGlow: '#bc6ff144',
  queenLine: '#bc6ff1',
  cream: '#f0e8d0',
  line: '#3d2912',
  waste: '#1a1a1488',
  ruler: 'rgba(160,128,96,0.35)',
  antBody: '#2a1606',
  antBodyAlt: '#3a2009',
  leaf: '#6fae3a',
}

// ── Initial colony state ─────────────────────────────────────────────────
// A single source of truth. The header reads it live, the chambers breathe
// with it, and it is interpolated into the intelligence system prompt.
export const INITIAL_COLONY = {
  population: 2847,
  food: 73,
  eggs: 412,
  age: 847,
  queenHealth: 92,
  fungus: 81,
  foragerActivity: 67,
  broodDev: 55,
  defense: 88,
  tunnelIntegrity: 96,
}

// The seven vitals bars (key into colony state + display label).
export const VITALS = [
  { key: 'food', label: 'Food Reserve' },
  { key: 'queenHealth', label: 'Queen Health' },
  { key: 'fungus', label: 'Fungal Garden' },
  { key: 'foragerActivity', label: 'Forager Activity' },
  { key: 'broodDev', label: 'Brood Development' },
  { key: 'defense', label: 'Defense Readiness' },
  { key: 'tunnelIntegrity', label: 'Tunnel Integrity' },
]

// Quick-query chips for the intelligence tab.
export const QUICK_QUERIES = [
  'Queen status',
  'Food crisis?',
  'Forager routes',
  'Larva care',
  'Threat detected?',
  'Tunnel expansion',
  'Chemical signals',
  'Winter prep',
]

// Procedurally surfaced colony-event strings (Vitals tab log).
export const EVENT_POOL = [
  'Forager column reinforced trail to canopy sector 4',
  'Fungal substrate turned in garden II',
  'Major workers repelled phorid fly at entrance',
  'Brood translocated 1.2m deeper — thermal gradient shift',
  'Leaf fragment throughput up 4% this cycle',
  'Queen laid clutch — primer pheromone elevated',
  'Waste chamber sealed; necrophoresis complete',
  'Minim escort detached from outbound leaf carriers',
  'CO₂ vented through auxiliary shaft 2',
  'Trail pheromone decayed on depleted route; abandoned',
  'New gallery excavated below fungal garden I',
  'Soldier caste mobilised along western perimeter',
  'Antibiotic secretion uptick in fungal cultivar',
  'Recruitment cascade triggered — rich foliage located',
  'Humidity stabilised in royal chamber at 98%',
  'Refuse pile relocated by waste-management caste',
  'Larvae spun cocoons in deep nursery',
  'Alarm pheromone cleared; perimeter nominal',
]

export const MODEL = 'claude-fable-5'
