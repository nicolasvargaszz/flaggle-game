/**
 * GlobleGame — guess the mystery country by distance.
 *
 * You can guess from the text input or by clicking a country on the 3D globe.
 */

import { useEffect, useMemo, useState } from "react";
import GlobeMap from "./GlobeMap.jsx";
import countries from "./countries.js";
import { haversineDistance, getProximityHint } from "./distances.js";
import CountryInput from "./countryinput.jsx";
import GameLayout from "./gamelayout.jsx";
import { GAME_MODES, getDailyCountry, getDailyKey } from "./gameModes.js";

const globeTargetCountries = countries.filter(country => country.mapPolygon);

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isAdjacent(country, target) {
  return (
    country.borders?.includes(target.code3) ||
    target.borders?.includes(country.code3)
  );
}

function buildGuess(country, target) {
  const distanceKm = haversineDistance(
    { lat: country.lat, lng: country.lng },
    { lat: target.lat, lng: target.lng }
  );
  const won = country.code3 === target.code3;
  const adjacent = !won && isAdjacent(country, target);
  const hint = won
    ? getProximityHint(0)
    : adjacent
      ? { label: "País vecino", cls: "neighbor" }
      : getProximityHint(distanceKm);

  return { country, distanceKm, hint, won, adjacent };
}

export default function GlobleGame({ initialMode = GAME_MODES.PRACTICE, onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [dailyKey, setDailyKey] = useState(() => getDailyKey());
  const [practiceTarget, setPracticeTarget] = useState(() => pickRandom(globeTargetCountries));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [alreadyGuessed, setAlreadyGuessed] = useState(null);
  const [showCountryLabels, setShowCountryLabels] = useState(true);

  const dailyTarget = useMemo(
    () => getDailyCountry(globeTargetCountries, dailyKey, "globle"),
    [dailyKey]
  );
  const target = mode === GAME_MODES.DAILY ? dailyTarget : practiceTarget;
  const guessedCodes = useMemo(
    () => new Set(guesses.map(guess => guess.country.code3)),
    [guesses]
  );
  const sortedByDistance = [...guesses].sort((a, b) => a.distanceKm - b.distanceKm);
  const closest = sortedByDistance[0];

  useEffect(() => {
    const timer = setInterval(() => {
      const currentKey = getDailyKey();
      setDailyKey(prevKey => (prevKey === currentKey ? prevKey : currentKey));
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode !== GAME_MODES.DAILY) return;
    resetRound();
  }, [dailyKey, mode]);

  function handleGuess(country) {
    if (gameWon) return;

    setSelectedCountry(country);

    if (guessedCodes.has(country.code3)) {
      setAlreadyGuessed(country.name);
      setTimeout(() => setAlreadyGuessed(null), 1500);
      return;
    }

    setAlreadyGuessed(null);
    const guess = buildGuess(country, target);

    setGuesses(prev => [guess, ...prev]);

    if (guess.won) setGameWon(true);
  }

  function resetRound() {
    setSelectedCountry(null);
    setGuesses([]);
    setGameWon(false);
    setAlreadyGuessed(null);
  }

  function startNewRound() {
    if (mode === GAME_MODES.PRACTICE) {
      setPracticeTarget(pickRandom(globeTargetCountries));
    }
    resetRound();
  }

  function changeMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (nextMode === GAME_MODES.PRACTICE) {
      setPracticeTarget(pickRandom(globeTargetCountries));
    }
    resetRound();
  }

  return (
    <GameLayout title="GLOBLE" emoji="🌍" onBack={onBack}>
      <section className="globle-play">
        <div className="mode-tabs" role="tablist" aria-label="Modo de juego">
          <button
            type="button"
            className={`mode-tab ${mode === GAME_MODES.PRACTICE ? "active" : ""}`}
            aria-pressed={mode === GAME_MODES.PRACTICE}
            onClick={() => changeMode(GAME_MODES.PRACTICE)}
          >
            Práctica
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === GAME_MODES.DAILY ? "active" : ""}`}
            aria-pressed={mode === GAME_MODES.DAILY}
            onClick={() => changeMode(GAME_MODES.DAILY)}
          >
            Diario
          </button>
        </div>

        {!gameWon && (
          <div className="globle-search">
            <CountryInput
              countries={countries}
              onSelect={handleGuess}
              disabled={gameWon}
              placeholder="Escribí un país o hacé click en el globo…"
            />
          </div>
        )}

        <div className="globle-summary">
          <span className="stat-pill">Intentos {guesses.length}</span>
          {mode === GAME_MODES.DAILY && (
            <span className="stat-pill">Diario {dailyKey}</span>
          )}
          <span className="stat-pill">Países {countries.length}</span>
          {closest && !gameWon && (
            <span className="stat-pill">
              Más cercano: {closest.country.name} · {closest.distanceKm.toLocaleString()} km
            </span>
          )}
          <button
            type="button"
            className={`label-toggle ${showCountryLabels ? "active" : ""}`}
            aria-pressed={showCountryLabels}
            onClick={() => setShowCountryLabels(value => !value)}
          >
            {showCountryLabels ? "Ocultar nombres" : "Mostrar nombres"}
          </button>
        </div>

        <GlobeMap
          countries={countries}
          guesses={guesses}
          selectedCountry={selectedCountry}
          targetCountry={target}
          revealTarget={gameWon}
          showCountryLabels={showCountryLabels}
          onCountryClick={handleGuess}
        />
      </section>

      {alreadyGuessed && (
        <p className="warning-msg">⚠ Ya intentaste {alreadyGuessed}</p>
      )}

      {gameWon && (
        <div className="win-banner">
          <p>🏆 ¡Era <strong>{target.name}</strong>! Ganaste en <strong>{guesses.length}</strong> intento{guesses.length !== 1 ? "s" : ""}.</p>
          <button className="btn btn-primary" onClick={startNewRound}>
            {mode === GAME_MODES.DAILY ? "Reintentar diario" : "Nuevo país"}
          </button>
        </div>
      )}

      {guesses.length > 0 && (
        <ul className="guess-list globle-guess-list">
          {guesses.map(guess => (
            <li key={guess.country.code3} className={`guess-item hint-${guess.hint.cls}`}>
              <img
                src={guess.country.flagPng}
                alt={guess.country.name}
                className="flag-mini"
              />
              <span className="guess-country-name">{guess.country.name}</span>
              <span className="guess-distance">
                {guess.won ? "🎯 0 km" : `${guess.distanceKm.toLocaleString()} km`}
              </span>
              {guess.adjacent && <span className="neighbor-badge">Vecino</span>}
              <span className="guess-hint-label">{guess.hint.label}</span>
            </li>
          ))}
        </ul>
      )}
    </GameLayout>
  );
}
