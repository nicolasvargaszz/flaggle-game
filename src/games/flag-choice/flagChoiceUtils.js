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

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
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
  const playableCountries = getPlayableCountries(countries);
  const target = getRandomCountryForLevel(countries, level, alreadyUsedCountries);
  const sameLevelDistractors = getCountriesByLevel(countries, level)
    .filter(country => country.code3 !== target.code3);
  const easierDistractors = playableCountries
    .filter(country => country.code3 !== target.code3 && country.difficulty <= target.difficulty);
  const anyDistractors = playableCountries.filter(country => country.code3 !== target.code3);
  const distractorPool = sameLevelDistractors.length >= optionCount - 1
    ? sameLevelDistractors
    : easierDistractors.length >= optionCount - 1
      ? easierDistractors
      : anyDistractors;
  const distractors = shuffle(distractorPool).slice(0, optionCount - 1);

  return {
    target,
    options: shuffle([target, ...distractors]),
  };
}
