import { DIFFICULTY_LABELS } from "../../data/countryDifficulty.js";

export const LEVELS = [
  {
    id: "principiante",
    name: DIFFICULTY_LABELS[1],
    difficulty: 1,
    lives: 5,
    questionsToAdvance: 3,
    description: "Países vecinos, grandes o muy reconocidos.",
  },
  {
    id: "facil",
    name: DIFFICULTY_LABELS[2],
    difficulty: 2,
    lives: 5,
    questionsToAdvance: 4,
    description: "Países conocidos y banderas relativamente familiares.",
  },
  {
    id: "turista",
    name: DIFFICULTY_LABELS[3],
    difficulty: 3,
    lives: 4,
    questionsToAdvance: 5,
    description: "Destinos turísticos y países bastante reconocibles.",
  },
  {
    id: "embajador",
    name: DIFFICULTY_LABELS[4],
    difficulty: 4,
    lives: 4,
    questionsToAdvance: 5,
    description: "Países de dificultad media.",
  },
  {
    id: "colonizador",
    name: DIFFICULTY_LABELS[5],
    difficulty: 5,
    lives: 3,
    questionsToAdvance: 6,
    description: "Países menos comunes para un estudiante promedio.",
  },
  {
    id: "explorador",
    name: DIFFICULTY_LABELS[6],
    difficulty: 6,
    lives: 3,
    questionsToAdvance: 6,
    description: "Países difíciles o banderas menos conocidas.",
  },
  {
    id: "dios",
    name: DIFFICULTY_LABELS[7],
    difficulty: 7,
    lives: 2,
    questionsToAdvance: 8,
    description: "Microestados, islas y países muy difíciles.",
  },
];

const DEFAULT_OPTION_COUNT = 4;

function getCountryId(country) {
  return country?.code3 ?? country?.code2 ?? country?.name;
}

function getCountryIdKey(country) {
  return String(getCountryId(country) ?? "").toLowerCase();
}

function getPreviousGuessKeys(previousGuesses = []) {
  return new Set(
    previousGuesses
      .map(guess => typeof guess === "string" ? guess : getCountryId(guess))
      .filter(Boolean)
      .map(guess => String(guess).toLowerCase())
  );
}

function isSameCountry(country, targetCountry) {
  return getCountryIdKey(country) === getCountryIdKey(targetCountry);
}

function uniqueCountries(countries) {
  const seen = new Set();

  return countries.filter(country => {
    const id = getCountryIdKey(country);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function shuffleArray(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function shuffle(items) {
  return shuffleArray(items);
}

export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getPlayableCountries(countries) {
  return countries.filter(country => country.flagPng && country.code3);
}

function normalizeLevel(level) {
  if (typeof level === "number") {
    return LEVELS.find(item => item.difficulty === level) ?? LEVELS[0];
  }
  if (typeof level === "string") {
    return LEVELS.find(item => item.id === level) ?? LEVELS[0];
  }
  return level ?? LEVELS[0];
}

export function getCountriesByLevel(countries, level) {
  const currentLevel = normalizeLevel(level);
  const playableCountries = getPlayableCountries(countries);
  const exactMatches = playableCountries.filter(
    country => country.difficulty === currentLevel.difficulty
  );

  return exactMatches.length > 0
    ? exactMatches
    : playableCountries.filter(country => country.difficulty <= currentLevel.difficulty);
}

function getDifficulty(country, currentLevel) {
  const normalizedLevel = normalizeLevel(currentLevel);
  return country?.difficulty ?? normalizedLevel.difficulty;
}

function getDifficultyGap(country, targetCountry, currentLevel) {
  return Math.abs(getDifficulty(country, currentLevel) - getDifficulty(targetCountry, currentLevel));
}

function hasSameRegion(country, targetCountry) {
  return Boolean(country.region && targetCountry.region && country.region === targetCountry.region);
}

function hasSameSubregion(country, targetCountry) {
  return Boolean(
    country.subregion
      && targetCountry.subregion
      && country.subregion === targetCountry.subregion
  );
}

function getFlagColorScore(country, targetCountry) {
  const countryColors = country.flagColors ?? country.flagColours ?? country.colors;
  const targetColors = targetCountry.flagColors ?? targetCountry.flagColours ?? targetCountry.colors;

  if (!Array.isArray(countryColors) || !Array.isArray(targetColors)) return 0;

  const targetColorSet = new Set(targetColors.map(color => String(color).toLowerCase()));
  return countryColors.filter(color => targetColorSet.has(String(color).toLowerCase())).length;
}

function scoreDecoyCountry(country, targetCountry, currentLevel, previousGuessKeys = new Set()) {
  const difficultyGap = getDifficultyGap(country, targetCountry, currentLevel);
  let score = 0;

  if (hasSameSubregion(country, targetCountry)) score += 60;
  if (hasSameRegion(country, targetCountry)) score += 30;
  score += Math.max(0, 24 - difficultyGap * 8);
  score += getFlagColorScore(country, targetCountry) * 10;

  if (previousGuessKeys.has(getCountryIdKey(country))) score -= 8;

  return score;
}

function sortDecoys(countries, targetCountry, currentLevel, previousGuessKeys = new Set()) {
  return shuffleArray(countries).sort(
    (first, second) =>
      scoreDecoyCountry(second, targetCountry, currentLevel, previousGuessKeys)
        - scoreDecoyCountry(first, targetCountry, currentLevel, previousGuessKeys)
  );
}

function addUniqueOptions(options, candidates, targetCountry, limit) {
  const selectedIds = new Set(options.map(getCountryIdKey));

  for (const candidate of candidates) {
    const candidateId = getCountryIdKey(candidate);
    if (!candidateId || selectedIds.has(candidateId) || isSameCountry(candidate, targetCountry)) {
      continue;
    }

    options.push(candidate);
    selectedIds.add(candidateId);

    if (options.length >= limit) break;
  }

  return options;
}

export function getNearbyDifficultyCountries(countries, targetCountry, currentLevel) {
  return getPlayableCountries(countries).filter(
    country => !isSameCountry(country, targetCountry)
      && getDifficultyGap(country, targetCountry, currentLevel) <= 1
  );
}

export function getSameRegionCountries(countries, targetCountry) {
  return getPlayableCountries(countries).filter(
    country => !isSameCountry(country, targetCountry)
      && (hasSameSubregion(country, targetCountry) || hasSameRegion(country, targetCountry))
  );
}

export function getDecoyCountries(targetCountry, countries, currentLevel) {
  const playableCountries = getPlayableCountries(countries);
  const sameSubregionNearby = playableCountries.filter(
    country => !isSameCountry(country, targetCountry)
      && hasSameSubregion(country, targetCountry)
      && getDifficultyGap(country, targetCountry, currentLevel) <= 1
  );
  const sameRegionNearby = playableCountries.filter(
    country => !isSameCountry(country, targetCountry)
      && hasSameRegion(country, targetCountry)
      && getDifficultyGap(country, targetCountry, currentLevel) <= 1
  );
  const sameRegion = getSameRegionCountries(countries, targetCountry);
  const nearbyDifficulty = getNearbyDifficultyCountries(countries, targetCountry, currentLevel);
  const globalFallback = playableCountries.filter(country => !isSameCountry(country, targetCountry));

  return uniqueCountries([
    ...sortDecoys(sameSubregionNearby, targetCountry, currentLevel),
    ...sortDecoys(sameRegionNearby, targetCountry, currentLevel),
    ...sortDecoys(sameRegion, targetCountry, currentLevel),
    ...sortDecoys(nearbyDifficulty, targetCountry, currentLevel),
    ...sortDecoys(globalFallback, targetCountry, currentLevel),
  ]);
}

export function generateMultipleChoiceOptions({
  targetCountry,
  countries,
  currentLevel,
  previousGuesses = [],
}) {
  const previousGuessKeys = getPreviousGuessKeys(previousGuesses);
  const decoyLimit = DEFAULT_OPTION_COUNT - 1;
  const decoyCandidates = getDecoyCountries(targetCountry, countries, currentLevel);
  const freshDecoys = decoyCandidates.filter(
    country => !previousGuessKeys.has(getCountryIdKey(country))
  );
  const fallbackDecoys = getPlayableCountries(countries).filter(
    country => !isSameCountry(country, targetCountry)
  );
  const selectedDecoys = [];

  addUniqueOptions(
    selectedDecoys,
    freshDecoys,
    targetCountry,
    decoyLimit
  );

  if (selectedDecoys.length < decoyLimit) {
    addUniqueOptions(
      selectedDecoys,
      decoyCandidates,
      targetCountry,
      decoyLimit
    );
  }

  if (selectedDecoys.length < decoyLimit) {
    addUniqueOptions(
      selectedDecoys,
      shuffleArray(fallbackDecoys),
      targetCountry,
      decoyLimit
    );
  }

  return shuffleArray([targetCountry, ...selectedDecoys.slice(0, decoyLimit)]);
}

export function getRandomCountryForLevel(countries, level, alreadyUsedCountries = []) {
  const usedCodes = new Set(alreadyUsedCountries);
  const levelCountries = getCountriesByLevel(countries, level);
  const freshCountries = levelCountries.filter(country => !usedCodes.has(country.code3));
  const pool = freshCountries.length > 0 ? freshCountries : levelCountries;

  return pickRandom(pool);
}

export function getLevelFromScore(score) {
  let scoreFloor = 0;

  for (const level of LEVELS) {
    const nextFloor = scoreFloor + level.questionsToAdvance;
    if (score < nextFloor || level === LEVELS[LEVELS.length - 1]) {
      return level;
    }
    scoreFloor = nextFloor;
  }

  return LEVELS[LEVELS.length - 1];
}

export function getLevelProgress(score) {
  const currentLevel = getLevelFromScore(score);
  const currentIndex = LEVELS.findIndex(level => level.id === currentLevel.id);
  const scoreFloor = LEVELS
    .slice(0, currentIndex)
    .reduce((total, level) => total + level.questionsToAdvance, 0);
  const currentProgress = score - scoreFloor;
  const isMaxLevel = currentIndex === LEVELS.length - 1;

  return {
    current: Math.max(0, currentProgress),
    required: currentLevel.questionsToAdvance,
    percent: isMaxLevel
      ? 100
      : Math.min(100, Math.round((currentProgress / currentLevel.questionsToAdvance) * 100)),
    isMaxLevel,
  };
}

export function createFlagChoiceRound(countries, level, alreadyUsedCountries = [], optionCount = 4) {
  const target = getRandomCountryForLevel(countries, level, alreadyUsedCountries);

  return {
    target,
    options: generateMultipleChoiceOptions({
      targetCountry: target,
      countries,
      currentLevel: level,
      previousGuesses: alreadyUsedCountries,
    }).slice(0, optionCount),
  };
}
