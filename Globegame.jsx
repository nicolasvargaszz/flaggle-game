/**
 * GlobleGame — guess the mystery country by distance.
 *
 * State:
 *   targetCountry  — the randomly chosen answer
 *   guesses        — array of { country, distanceKm, hint }
 *   gameWon        — boolean
 */

import { useState, useMemo } from "react";
import countries from "./countries.js";
import { haversineDistance, getProximityHint } from "./distances.js";
import CountryInput from "./countryinput.jsx";
import GameLayout from "./gamelayout.jsx";

const MAX_GUESSES = 8;
const GLOBE_RADIUS = 42;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isAdjacent(country, target) {
  return (
    country.borders?.includes(target.code3) ||
    target.borders?.includes(country.code3)
  );
}

function getGlobeProjection(country, center) {
  const toRad = deg => (deg * Math.PI) / 180;
  const lat = toRad(country.lat);
  const lng = toRad(country.lng - center.lng);
  const centerLat = toRad(center.lat);

  const visibility =
    Math.sin(centerLat) * Math.sin(lat) +
    Math.cos(centerLat) * Math.cos(lat) * Math.cos(lng);

  const x = 50 + GLOBE_RADIUS * Math.cos(lat) * Math.sin(lng);
  const y =
    50 -
    GLOBE_RADIUS *
      (Math.cos(centerLat) * Math.sin(lat) -
        Math.sin(centerLat) * Math.cos(lat) * Math.cos(lng));

  return {
    left: `${Math.max(7, Math.min(93, x))}%`,
    top: `${Math.max(7, Math.min(93, y))}%`,
    visible: visibility >= -0.05,
  };
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
  const [target, setTarget] = useState(() => pickRandom(countries));
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [alreadyGuessed, setAlreadyGuessed] = useState(null);

  const guessedCodes = useMemo(() => new Set(guesses.map(g => g.country.code3)), [guesses]);
  const gameOver = gameWon || gameLost;

  function handleGuess(country) {
    if (gameOver) return;

    if (guessedCodes.has(country.code3)) {
      setAlreadyGuessed(country.name);
      setTimeout(() => setAlreadyGuessed(null), 1500);
      return;
    }
    setAlreadyGuessed(null);

    const guess = buildGuess(country, target);

    setGuesses(prev => [
      guess,
      ...prev,           // newest first
    ]);

    if (guess.won) setGameWon(true);
    if (!guess.won && guesses.length + 1 >= MAX_GUESSES) setGameLost(true);
  }

  function restart() {
    setTarget(pickRandom(countries));
    setGuesses([]);
    setGameWon(false);
    setGameLost(false);
    setAlreadyGuessed(null);
  }

  function giveUp() {
    setGameLost(true);
  }

  // Sort a copy of guesses by distance for the "closest" indicator, but keep
  // display order as newest-first (we already push to front).
  const sortedByDist = [...guesses].sort((a, b) => a.distanceKm - b.distanceKm);
  const closest = sortedByDist[0];
  const centerCountry = gameOver ? target : closest?.country ?? guesses[0]?.country;

  return (
    <GameLayout title="Globle" emoji="🌍" onBack={onBack}>
      <div className="globle-board">
        <GlobeView
          guesses={guesses}
          target={target}
          gameOver={gameOver}
          centerCountry={centerCountry}
        />

        <div className="globle-mystery-card">
          <p className="mystery-label">
            {gameWon
              ? `¡Era ${target.name}! 🎉`
              : gameLost
                ? `Era ${target.name}`
              : `¿Cuál es el país misterioso?`}
          </p>
          <div className="globle-stats">
            <span className="stat-pill">
              Intentos {guesses.length}/{MAX_GUESSES}
            </span>
            <span className="stat-pill">
              Países {countries.length}
            </span>
          </div>
          {closest && !gameWon && (
            <p className="closest-hint">
              Más cercano: <strong>{closest.country.name}</strong> - {closest.distanceKm.toLocaleString()} km
              {closest.adjacent ? " - comparte frontera" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Input */}
      {!gameOver && (
        <div className="input-row">
          <CountryInput
            countries={countries}
            onSelect={handleGuess}
            disabled={gameOver}
            placeholder="Escribí un país y presioná Enter…"
          />
        </div>
      )}

      {alreadyGuessed && (
        <p className="warning-msg">⚠ Ya intentaste {alreadyGuessed}</p>
      )}

      {/* Play again */}
      {gameWon && (
        <div className="win-banner">
          <p>🏆 ¡Ganaste en <strong>{guesses.length}</strong> intento{guesses.length !== 1 ? "s" : ""}!</p>
          <button className="btn btn-primary" onClick={restart}>
            Jugar de nuevo
          </button>
        </div>
      )}
      {gameLost && (
        <div className="lose-banner">
          <p>
            El país misterioso era <strong>{target.name}</strong>.
          </p>
          <button className="btn btn-primary" onClick={restart}>
            Jugar de nuevo
          </button>
        </div>
      )}
      {!gameOver && guesses.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
          <button className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }} onClick={giveUp}>
            Rendirse
          </button>
        </div>
      )}

      {/* Guess list */}
      {guesses.length > 0 && (
        <ul className="guess-list">
          {guesses.map((g, i) => (
            <li key={g.country.code3} className={`guess-item hint-${g.hint.cls}`}>
              <img
                src={g.country.flagPng}
                alt={g.country.name}
                className="flag-mini"
              />
              <span className="guess-country-name">{g.country.name}</span>
              <span className="guess-distance">
                {g.won ? "🎯 0 km" : `${g.distanceKm.toLocaleString()} km`}
              </span>
              {g.adjacent && <span className="neighbor-badge">Vecino</span>}
              <span className="guess-hint-label">{g.hint.label}</span>
            </li>
          ))}
        </ul>
      )}
    </GameLayout>
  );
}

function GlobeView({ guesses, target, gameOver, centerCountry }) {
  const center = centerCountry
    ? { lat: centerCountry.lat, lng: centerCountry.lng }
    : { lat: 10, lng: -20 };
  const markers = [
    ...guesses.map((guess, index) => ({
      key: guess.country.code3,
      country: guess.country,
      label: guess.country.name,
      className: guess.won ? "exact" : guess.adjacent ? "neighbor" : guess.hint.cls,
      index: guesses.length - index,
    })),
    ...(gameOver
      ? [{
          key: `target-${target.code3}`,
          country: target,
          label: target.name,
          className: "target",
          index: "★",
        }]
      : []),
  ];

  return (
    <div className="globe-panel">
      <div className="world-globe" aria-label="Globo con los intentos marcados">
        <div className="globe-shadow" />
        {markers.map(marker => {
          const position = getGlobeProjection(marker.country, center);
          return (
            <span
              key={marker.key}
              className={`globe-marker marker-${marker.className} ${position.visible ? "" : "marker-hidden-side"}`}
              style={{ left: position.left, top: position.top }}
              title={marker.label}
              aria-label={marker.label}
            >
              {marker.index}
            </span>
          );
        })}
      </div>
    </div>
  );
}
