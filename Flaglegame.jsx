/**
 * FlagleGame — reveal a mystery flag through pixel-colour matching.
 *
 * How it works:
 *  1. A target country is chosen at random.
 *  2. The player types/selects a country guess.
 *  3. Both flags are drawn to off-screen canvases (same size, white bg).
 *  4. We compare every pixel; pixels within COLOR_THRESHOLD are added to a mask.
 *  5. The mask is OR-merged with all previous masks and applied to the visible canvas.
 *  6. If the player guesses correctly, the full flag is revealed.
 *
 * Files to edit for algorithm changes:
 *   pixelmatch.js  has all pixel math.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import countries from "./countries.js";
import {
  loadImage,
  getImageDataFromFlag,
  compareFlags,
  mergeMasks,
  calculateMatchPercentage,
  drawRevealedFlag,
  CANVAS_W,
  CANVAS_H,
} from "./pixelmatch.js";
import CountryInput from "./countryinput.jsx";
import GameLayout from "./gamelayout.jsx";
import { GAME_MODES, getDailyCountry, getDailyKey } from "./gameModes.js";

const MAX_GUESSES = 6;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function FlagleGame({ initialMode = GAME_MODES.PRACTICE, onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [dailyKey, setDailyKey] = useState(() => getDailyKey());
  const [practiceTarget, setPracticeTarget] = useState(() => pickRandom(countries));
  const [guesses, setGuesses] = useState([]);           // [{ country, matchPct }]
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyGuessed, setAlreadyGuessed] = useState(null);

  // Refs that persist between renders without triggering re-renders
  const canvasRef = useRef(null);
  const maskRef = useRef(null);              // Uint8Array | null
  const targetImageDataRef = useRef(null);   // ImageData | null

  const guessedCodes = useMemo(() => new Set(guesses.map(g => g.country.code3)), [guesses]);
  const gameOver = gameWon || gameLost;
  const dailyTarget = useMemo(
    () => getDailyCountry(countries, dailyKey, "flagle"),
    [dailyKey]
  );
  const target = mode === GAME_MODES.DAILY ? dailyTarget : practiceTarget;

  const revealFullFlag = useCallback(() => {
    if (!canvasRef.current || !targetImageDataRef.current) return;
    const fullMask = new Uint8Array(CANVAS_W * CANVAS_H).fill(1);
    maskRef.current = fullMask;
    drawRevealedFlag(canvasRef.current, targetImageDataRef.current, fullMask);
  }, []);

  // ── Load target flag on mount / restart ─────────────────────────────────
  const loadTarget = useCallback(async (country) => {
    setLoading(true);
    setError(null);
    maskRef.current = null;
    targetImageDataRef.current = null;

    try {
      const img = await loadImage(country.flagPng);
      const imageData = getImageDataFromFlag(img, CANVAS_W, CANVAS_H);
      targetImageDataRef.current = imageData;

      // Start with empty mask (all hidden)
      maskRef.current = new Uint8Array(CANVAS_W * CANVAS_H);
      // Draw the empty (fully hidden) state
      if (canvasRef.current) {
        drawRevealedFlag(canvasRef.current, imageData, maskRef.current);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la bandera objetivo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTarget(target);
  }, [target, loadTarget]);

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

  // When canvas mounts after a restart, redraw current mask
  useEffect(() => {
    if (canvasRef.current && maskRef.current && targetImageDataRef.current) {
      drawRevealedFlag(canvasRef.current, targetImageDataRef.current, maskRef.current);
    }
  });

  // ── Handle guess ─────────────────────────────────────────────────────────
  async function handleGuess(country) {
    if (gameOver || loading) return;

    if (guessedCodes.has(country.code3)) {
      setAlreadyGuessed(country.name);
      setTimeout(() => setAlreadyGuessed(null), 1500);
      return;
    }
    setAlreadyGuessed(null);
    setLoading(true);

    try {
      const won = country.code3 === target.code3;

      if (won) {
        revealFullFlag();
        setGuesses(prev => [
          ...prev,
          { country, matchPct: 100, won: true },
        ]);
        setGameWon(true);
      } else {
        // Load guess flag and compare
        const guessImg = await loadImage(country.flagPng);
        const guessData = getImageDataFromFlag(guessImg, CANVAS_W, CANVAS_H);

        const newMask = compareFlags(targetImageDataRef.current, guessData);
        const merged = mergeMasks(maskRef.current, newMask);
        maskRef.current = merged;

        const matchPct = calculateMatchPercentage(newMask); // pct for THIS guess only

        // Redraw with merged mask
        if (canvasRef.current) {
          drawRevealedFlag(canvasRef.current, targetImageDataRef.current, merged);
        }

        setGuesses(prev => [...prev, { country, matchPct, won: false }]);
        if (guesses.length + 1 >= MAX_GUESSES) {
          revealFullFlag();
          setGameLost(true);
        }
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar la bandera. Intenta con otro país.");
    } finally {
      setLoading(false);
    }
  }

  function resetRound() {
    setGuesses([]);
    setGameWon(false);
    setGameLost(false);
    setError(null);
    setAlreadyGuessed(null);
  }

  function startNewRound() {
    if (mode === GAME_MODES.PRACTICE) {
      setPracticeTarget(pickRandom(countries));
    }
    resetRound();
  }

  function changeMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (nextMode === GAME_MODES.PRACTICE) {
      setPracticeTarget(pickRandom(countries));
    }
    resetRound();
  }

  function giveUp() {
    revealFullFlag();
    setGameLost(true);
  }

  // ── Total revealed % across all guesses ──────────────────────────────────
  const totalRevealed = maskRef.current ? calculateMatchPercentage(maskRef.current) : 0;

  return (
    <GameLayout title="Flagle" emoji="🚩" onBack={onBack}>
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
          La bandera del día
        </button>
      </div>

      {/* Canvas — the progressively revealed flag */}
      <div className="flagle-canvas-wrapper">
        {loading && <div className="flagle-loading">Cargando bandera…</div>}
        <canvas
          ref={canvasRef}
          className="flagle-canvas"
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: loading ? "none" : "block" }}
        />
        {!loading && (
          <>
          <div className="reveal-bar">
            <div
              className="reveal-bar-fill"
              style={{ width: `${totalRevealed}%` }}
            />
            <span className="reveal-bar-label">{totalRevealed}% revelado</span>
          </div>
          <p className="attempt-meta">
            Intentos: {guesses.length}/{MAX_GUESSES}
          </p>
          </>
        )}
        {mode === GAME_MODES.DAILY && (
          <p className="attempt-meta">Reto diario {dailyKey}</p>
        )}
      </div>

      {error && <p className="error-msg">⚠ {error}</p>}

      {/* Win state */}
      {gameWon && (
        <div className="win-banner">
          <p>
            🎉 ¡Era <strong>{target.name}</strong>! Ganaste en{" "}
            <strong>{guesses.length}</strong> intento
            {guesses.length !== 1 ? "s" : ""}.
          </p>
          <button className="btn btn-primary" onClick={startNewRound}>
            {mode === GAME_MODES.DAILY ? "Reintentar bandera" : "Nueva bandera"}
          </button>
        </div>
      )}

      {gameLost && (
        <div className="lose-banner">
          <p>
            Era <strong>{target.name}</strong>. La bandera completa ya está revelada.
          </p>
          <button className="btn btn-primary" onClick={startNewRound}>
            {mode === GAME_MODES.DAILY ? "Reintentar bandera" : "Nueva bandera"}
          </button>
        </div>
      )}

      {/* Input row */}
      {!gameOver && (
        <div className="input-row">
          <CountryInput
            countries={countries}
            onSelect={handleGuess}
            disabled={gameOver || loading}
            placeholder="Escribí un país y presioná Enter…"
          />
        </div>
      )}

      {alreadyGuessed && (
        <p className="warning-msg">⚠ Ya intentaste {alreadyGuessed}</p>
      )}

      {!gameOver && guesses.length > 0 && (
        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
            onClick={giveUp}
          >
            Rendirse
          </button>
        </div>
      )}

      {/* Guess list */}
      {guesses.length > 0 && (
        <ul className="guess-list">
          {[...guesses].reverse().map((g, i) => (
            <li key={g.country.code3} className={`guess-item ${g.won ? "hint-exact" : ""}`}>
              <img
                src={g.country.flagPng}
                alt={g.country.name}
                className="flag-mini"
              />
              <span className="guess-country-name">{g.country.name}</span>
              <span className="guess-match-pct">
                {g.won ? "✅ ¡Correcto!" : `${g.matchPct}% coincidencia`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GameLayout>
  );
}
