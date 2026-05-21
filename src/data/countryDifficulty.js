export const DIFFICULTY_LABELS = {
  1: "Principiante",
  2: "Fácil",
  3: "Turista",
  4: "Embajador",
  5: "Colonizador",
  6: "Explorador",
  7: "Dios",
};

const MANUAL_DIFFICULTY_BY_CODE3 = {
  // 1. Principiante
  PRY: 1,
  ARG: 1,
  BRA: 1,
  URY: 1,
  BOL: 1,
  CHL: 1,
  USA: 1,
  ESP: 1,
  FRA: 1,
  DEU: 1,
  ITA: 1,
  JPN: 1,
  CHN: 1,
  MEX: 1,
  GBR: 1,

  // 2. Fácil
  PER: 2,
  COL: 2,
  VEN: 2,
  ECU: 2,
  CAN: 2,
  PRT: 2,
  RUS: 2,
  IND: 2,
  KOR: 2,
  AUS: 2,
  NLD: 2,
  CHE: 2,

  // 3. Turista
  GRC: 3,
  TUR: 3,
  EGY: 3,
  MAR: 3,
  THA: 3,
  VNM: 3,
  SWE: 3,
  NOR: 3,
  DNK: 3,
  BEL: 3,
  POL: 3,
  AUT: 3,
  IRL: 3,

  // 4. Embajador
  FIN: 4,
  CZE: 4,
  HUN: 4,
  HRV: 4,
  UKR: 4,
  SAU: 4,
  ZAF: 4,
  NGA: 4,
  KEN: 4,
  ISR: 4,
  NZL: 4,
  SGP: 4,

  // 5. Colonizador
  MMR: 5,
  SOM: 5,
  BRB: 5,
  ISL: 5,
  EST: 5,
  LVA: 5,
  LTU: 5,
  SVK: 5,
  SVN: 5,
  SRB: 5,
  DZA: 5,
  TUN: 5,

  // 6. Explorador
  NPL: 6,
  BTN: 6,
  LAO: 6,
  KHM: 6,
  MNG: 6,
  ARM: 6,
  GEO: 6,
  AZE: 6,
  UZB: 6,
  KAZ: 6,
  ETH: 6,
  GHA: 6,

  // 7. Dios
  VAT: 7,
  SMR: 7,
  AND: 7,
  LIE: 7,
  MCO: 7,
  MLT: 7,
  SYC: 7,
  COM: 7,
  KIR: 7,
  TUV: 7,
  NRU: 7,
  PLW: 7,
  LCA: 7,
};

const EXTRA_HARD_SMALL_ISLANDS = new Set([
  "ATG",
  "DMA",
  "FSM",
  "GRD",
  "KNA",
  "MHL",
  "SLB",
  "TON",
  "VCT",
  "VUT",
  "WSM",
]);

export function assignDifficulty(country) {
  const manualDifficulty = MANUAL_DIFFICULTY_BY_CODE3[country.code3];
  if (manualDifficulty) return manualDifficulty;

  if (EXTRA_HARD_SMALL_ISLANDS.has(country.code3)) return 7;
  if (country.subregion === "Caribbean") return 6;
  if (country.region === "Oceania") return 6;
  if (country.subregion === "South America") return 2;
  if (country.subregion === "North America") return 3;
  if (country.region === "Africa") return 5;
  if (country.region === "Asia") return 4;
  if (country.region === "Europe") return 4;

  return 5;
}

export function withDifficulty(country) {
  const difficulty = assignDifficulty(country);
  return {
    ...country,
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty],
  };
}
