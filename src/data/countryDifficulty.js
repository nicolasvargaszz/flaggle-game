export const DIFFICULTY_LABELS = {
  1: "Principiante",
  2: "Fácil",
  3: "Turista",
  4: "Embajador",
  5: "Colonizador",
  6: "Explorador",
  7: "Dios",
};

export const COUNTRY_DIFFICULTY_BY_CODE2 = {
  // 1. Principiante
  py: 1,
  ar: 1,
  br: 1,
  uy: 1,
  bo: 1,
  cl: 1,
  us: 1,
  es: 1,
  fr: 1,
  de: 1,
  it: 1,
  jp: 1,
  cn: 1,
  mx: 1,
  gb: 1,

  // 2. Fácil
  pe: 2,
  co: 2,
  ve: 2,
  ec: 2,
  ca: 2,
  pt: 2,
  ru: 2,
  in: 2,
  kr: 2,
  au: 2,
  nl: 2,
  ch: 2,

  // 3. Turista
  gr: 3,
  tr: 3,
  eg: 3,
  ma: 3,
  th: 3,
  vn: 3,
  se: 3,
  no: 3,
  dk: 3,
  be: 3,
  pl: 3,
  at: 3,
  ie: 3,

  // 4. Embajador
  fi: 4,
  cz: 4,
  hu: 4,
  hr: 4,
  ua: 4,
  sa: 4,
  za: 4,
  ng: 4,
  ke: 4,
  il: 4,
  nz: 4,
  sg: 4,

  // 5. Colonizador
  mm: 5,
  so: 5,
  bb: 5,
  is: 5,
  ee: 5,
  lv: 5,
  lt: 5,
  sk: 5,
  si: 5,
  rs: 5,
  dz: 5,
  tn: 5,

  // 6. Explorador
  np: 6,
  bt: 6,
  la: 6,
  kh: 6,
  mn: 6,
  am: 6,
  ge: 6,
  az: 6,
  uz: 6,
  kz: 6,
  et: 6,
  gh: 6,

  // 7. Dios
  va: 7,
  sm: 7,
  ad: 7,
  li: 7,
  mc: 7,
  mt: 7,
  sc: 7,
  km: 7,
  ki: 7,
  tv: 7,
  nr: 7,
  pw: 7,
  lc: 7,
};

export const COUNTRY_DIFFICULTY_BY_CODE3 = {
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

const EASY_SOUTH_AMERICA_CODES = new Set([
  "py",
  "ar",
  "br",
  "uy",
  "bo",
  "cl",
  "pe",
  "co",
  "ve",
  "ec",
]);

const BIG_RECOGNIZABLE_CODES = new Set([
  "us",
  "ca",
  "mx",
  "gb",
  "fr",
  "de",
  "it",
  "es",
  "pt",
  "ru",
  "cn",
  "jp",
  "in",
  "kr",
  "au",
]);

const VERY_HARD_SMALL_ISLANDS = new Set([
  "ag",
  "dm",
  "fm",
  "gd",
  "kn",
  "mh",
  "sb",
  "to",
  "vc",
  "vu",
  "ws",
]);

function normalizeCode2(code2) {
  return String(code2 ?? "").trim().toLowerCase();
}

function normalizeCode3(code3) {
  return String(code3 ?? "").trim().toUpperCase();
}

export function getDifficultyLabel(difficulty) {
  return DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS[4];
}

export function inferDifficulty(country) {
  const code2 = normalizeCode2(country.code2);

  if (EASY_SOUTH_AMERICA_CODES.has(code2)) return 2;
  if (BIG_RECOGNIZABLE_CODES.has(code2)) return 3;
  if (VERY_HARD_SMALL_ISLANDS.has(code2)) return 7;
  if (country.subregion === "Caribbean") return 6;
  if (country.region === "Oceania") return 6;
  if (country.region === "Africa") return 5;
  if (country.subregion === "South America") return 2;
  if (country.subregion === "North America") return 3;
  if (country.region === "Europe") return 4;
  if (country.region === "Asia") return 4;
  if (country.region === "Americas") return 4;

  return 4;
}

export function getCountryDifficulty(country) {
  const code2 = normalizeCode2(country.code2);
  const code3 = normalizeCode3(country.code3);

  return COUNTRY_DIFFICULTY_BY_CODE2[code2]
    ?? COUNTRY_DIFFICULTY_BY_CODE3[code3]
    ?? inferDifficulty(country);
}

export function enrichCountriesWithDifficulty(countries) {
  return countries.map(country => {
    const difficulty = getCountryDifficulty(country);

    return {
      ...country,
      difficulty,
      difficultyLabel: getDifficultyLabel(difficulty),
    };
  });
}

export function assignDifficulty(country) {
  return getCountryDifficulty(country);
}

export function withDifficulty(country) {
  return enrichCountriesWithDifficulty([country])[0];
}
