/**
 * GlobleGame — guess the mystery country by distance.
 *
 * You can guess from the text input or by clicking a country on the 3D globe.
 */

import { useMemo, useState } from "react";
import GlobeMap from "./GlobeMap.jsx";
import countries from "./countries.js";
import { haversineDistance, getProximityHint } from "./distances.js";
import CountryInput from "./countryinput.jsx";
import GameLayout from "./gamelayout.jsx";

const MAX_GUESSES = 8;
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

export default function GlobleGame({ onBack }) {
  const [target, setTarget] = useState(() => pickRandom(globeTargetCountries));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [alreadyGuessed, setAlreadyGuessed] = useState(null);

  const guessedCodes = useMemo(
    () => new Set(guesses.map(guess => guess.country.code3)),
    [guesses]
  );
  const gameOver = gameWon || gameLost;
  const sortedByDistance = [...guesses].sort((a, b) => a.distanceKm - b.distanceKm);
  const closest = sortedByDistance[0];

  function handleGuess(country) {
    if (gameOver) return;

    setSelectedCountry(country);

    if (guessedCodes.has(country.code3)) {
      setAlreadyGuessed(country.name);
      setTimeout(() => setAlreadyGuessed(null), 1500);
      return;
    }

    setAlreadyGuessed(null);
    const guess = buildGuess(country, target);
    const nextGuessCount = guesses.length + 1;

    setGuesses(prev => [guess, ...prev]);

    if (guess.won) setGameWon(true);
    if (!guess.won && nextGuessCount >= MAX_GUESSES) setGameLost(true);
  }

  function restart() {
    setTarget(pickRandom(globeTargetCountries));
    setSelectedCountry(null);
    setGuesses([]);
    setGameWon(false);
    setGameLost(false);
    setAlreadyGuessed(null);
  }

  function giveUp() {
    setSelectedCountry(target);
    setGameLost(true);
  }

  return (
    <GameLayout title="GLOBLE" emoji="🌍" onBack={onBack}>
      <section className="globle-play">
        {!gameOver && (
          <div className="globle-search">
            <CountryInput
              countries={countries}
              onSelect={handleGuess}
              disabled={gameOver}
              placeholder="Escribí un país o hacé click en el globo…"
            />
          </div>
        )}

        <div className="globle-summary">
          <span className="stat-pill">Intentos {guesses.length}/{MAX_GUESSES}</span>
          <span className="stat-pill">Países {countries.length}</span>
          {closest && !gameWon && (
            <span className="stat-pill">
              Más cercano: {closest.country.name} · {closest.distanceKm.toLocaleString()} km
            </span>
          )}
        </div>

        <GlobeMap
          countries={countries}
          guesses={guesses}
          selectedCountry={selectedCountry}
          targetCountry={target}
          revealTarget={gameOver}
          onCountryClick={handleGuess}
        />
      </section>

      {alreadyGuessed && (
        <p className="warning-msg">⚠ Ya intentaste {alreadyGuessed}</p>
      )}

      {gameWon && (
        <div className="win-banner">
          <p>🏆 ¡Era <strong>{target.name}</strong>! Ganaste en <strong>{guesses.length}</strong> intento{guesses.length !== 1 ? "s" : ""}.</p>
          <button className="btn btn-primary" onClick={restart}>
            Jugar de nuevo
          </button>
        </div>
      )}

      {gameLost && (
        <div className="lose-banner">
          <p>El país misterioso era <strong>{target.name}</strong>.</p>
          <button className="btn btn-primary" onClick={restart}>
            Jugar de nuevo
          </button>
        </div>
      )}

      {!gameOver && guesses.length > 0 && (
        <div className="globle-actions">
          <button className="btn btn-ghost btn-small" onClick={giveUp}>
            Rendirse
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
