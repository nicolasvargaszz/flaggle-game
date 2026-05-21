export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createFlagChoiceRound(countries, previousCode = null, optionCount = 4) {
  const playableCountries = countries.filter(country => country.flagPng && country.code3);
  const targetPool = playableCountries.length > 1
    ? playableCountries.filter(country => country.code3 !== previousCode)
    : playableCountries;
  const target = pickRandom(targetPool);
  const distractors = shuffle(
    playableCountries.filter(country => country.code3 !== target.code3)
  ).slice(0, optionCount - 1);

  return {
    target,
    options: shuffle([target, ...distractors]),
  };
}
