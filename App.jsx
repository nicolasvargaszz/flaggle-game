import { Suspense, lazy, useState } from "react";
import { GAME_MODES } from "./gameModes.js";
import "./style.css";

const FlagleGame = lazy(() => import("./Flaglegame.jsx"));
const GlobleGame = lazy(() => import("./Globegame.jsx"));
const SCREENS = { HOME: "home", FLAGLE: "flagle", GLOBLE: "globle" };
const GAME_LABELS = {
  [SCREENS.FLAGLE]: {
    title: "Flagle",
    emoji: "🚩",
    dailyTitle: "La bandera del día",
    dailyDesc: "Una bandera fija para todos. Cambia cada 24 horas.",
    practiceDesc: "Banderas aleatorias para practicar sin presión.",
  },
  [SCREENS.GLOBLE]: {
    title: "Globle",
    emoji: "🌍",
    dailyTitle: "El país del día",
    dailyDesc: "Un país fijo para todos. Cambia cada 24 horas.",
    practiceDesc: "Países aleatorios para jugar todas las rondas que quieras.",
  },
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [pendingGame, setPendingGame] = useState(null);
  const [gameMode, setGameMode] = useState(GAME_MODES.PRACTICE);

  function openModeSelect(game) {
    setPendingGame(game);
  }

  function startGame(mode) {
    setGameMode(mode);
    setScreen(pendingGame);
    setPendingGame(null);
  }

  function goHome() {
    setScreen(SCREENS.HOME);
    setPendingGame(null);
  }

  if (screen === SCREENS.FLAGLE) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <FlagleGame initialMode={gameMode} onBack={goHome} />
      </Suspense>
    );
  }
  if (screen === SCREENS.GLOBLE) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <GlobleGame initialMode={gameMode} onBack={goHome} />
      </Suspense>
    );
  }
  if (pendingGame) {
    return (
      <ModeSelectScreen
        game={GAME_LABELS[pendingGame]}
        onBack={() => setPendingGame(null)}
        onSelect={startGame}
      />
    );
  }
  return <HomeScreen onSelect={openModeSelect} />;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      Cargando…
    </div>
  );
}

function HomeScreen({ onSelect }) {
  return (
    <div className="home-screen">
      <div className="home-hero">
        <div className="home-logo">🗺️</div>
        <h1 className="home-title">GeoGuess Games</h1>
        <p className="home-subtitle">
          Ponés a prueba tu conocimiento de países, banderas y geografía.
        </p>
      </div>
      <div className="game-cards">
        <button className="game-card" onClick={() => onSelect(SCREENS.FLAGLE)}>
          <span className="game-card-emoji">🚩</span>
          <h2 className="game-card-title">Flagle</h2>
          <p className="game-card-desc">
            Adivina el país a partir de su bandera. Cada intento revela más píxeles.
          </p>
          <span className="game-card-cta">Jugar →</span>
        </button>
        <button className="game-card" onClick={() => onSelect(SCREENS.GLOBLE)}>
          <span className="game-card-emoji">🌍</span>
          <h2 className="game-card-title">Globle</h2>
          <p className="game-card-desc">
            Adivina el país misterioso. Te decimos qué tan cerca o lejos estás en km.
          </p>
          <span className="game-card-cta">Jugar →</span>
        </button>
      </div>
      <footer className="home-footer">
        Inspirado en Flagle &amp; Globle · Prototipo educativo
      </footer>
    </div>
  );
}

function ModeSelectScreen({ game, onBack, onSelect }) {
  return (
    <div className="mode-select-screen">
      <button className="btn btn-ghost back-btn mode-back-btn" onClick={onBack}>
        ← Volver
      </button>
      <div className="mode-select-header">
        <span className="mode-select-emoji">{game.emoji}</span>
        <h1 className="mode-select-title">{game.title}</h1>
        <p className="mode-select-subtitle">Elegí cómo querés jugar.</p>
      </div>
      <div className="mode-choice-grid">
        <button className="mode-choice-card" onClick={() => onSelect(GAME_MODES.PRACTICE)}>
          <span className="mode-choice-kicker">Modo</span>
          <strong>Práctica</strong>
          <p>{game.practiceDesc}</p>
        </button>
        <button className="mode-choice-card daily" onClick={() => onSelect(GAME_MODES.DAILY)}>
          <span className="mode-choice-kicker">Reto diario</span>
          <strong>{game.dailyTitle}</strong>
          <p>{game.dailyDesc}</p>
        </button>
      </div>
    </div>
  );
}
