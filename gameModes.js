export const GAME_MODES = {
  PRACTICE: "practice",
  DAILY: "daily",
};

export function getDailyKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyCountry(countryList, dailyKey, namespace) {
  return countryList[hashString(`${namespace}:${dailyKey}`) % countryList.length];
}
