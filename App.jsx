import { Suspense, lazy, useEffect, useState } from "react";
import { GAME_MODES } from "./gameModes.js";
import { LANDMARK_SLIDES } from "./src/data/homeLandmarks.js";
import "./style.css";

const FlagleGame = lazy(() => import("./Flaglegame.jsx"));
const GlobleGame = lazy(() => import("./Globegame.jsx"));
const FlagChoiceGame = lazy(() => import("./src/games/flag-choice/FlagChoiceGame.jsx"));
const SCREENS = {
  HOME: "home",
  FLAGLE: "flagle",
  GLOBLE: "globle",
  FLAG_CHOICE: "flag-choice",
};
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
    if (game === SCREENS.FLAG_CHOICE) {
      setScreen(game);
      return;
    }
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
  if (screen === SCREENS.FLAG_CHOICE) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <FlagChoiceGame onBack={goHome} />
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
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = LANDMARK_SLIDES[activeSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(index => (index + 1) % LANDMARK_SLIDES.length);
    }, 5200);

    return () => clearInterval(timer);
  }, []);

  function goToSlide(index) {
    setActiveSlide((index + LANDMARK_SLIDES.length) % LANDMARK_SLIDES.length);
  }

  return (
    <div className="home-screen">
      <section className="home-showcase" aria-label="Lugares históricos del mundo">
        <div className="home-carousel">
          {LANDMARK_SLIDES.map((item, index) => (
            <img
              key={item.title}
              src={item.image}
              alt={`${item.title}, ${item.location}`}
              className={`home-carousel-image ${index === activeSlide ? "active" : ""}`}
              style={{ objectPosition: item.position }}
            />
          ))}
          <div className="home-carousel-scrim" />

          <div className="home-hero">
            <span className="home-kicker">Banderas, países y mapas</span>
            <h1 className="home-title">GeoGuess Games</h1>
            <p className="home-subtitle">
              Poné a prueba tu conocimiento del mundo con tres juegos rápidos de geografía.
            </p>
          </div>

          <div className="home-carousel-caption">
            <div>
              <span>{slide.title}</span>
              <strong>{slide.location}</strong>
            </div>
            <a href={slide.sourceUrl} target="_blank" rel="noreferrer">
              Foto: Wikimedia Commons
            </a>
          </div>

          <button
            className="home-carousel-btn prev"
            aria-label="Lugar anterior"
            onClick={() => goToSlide(activeSlide - 1)}
          >
            ‹
          </button>
          <button
            className="home-carousel-btn next"
            aria-label="Lugar siguiente"
            onClick={() => goToSlide(activeSlide + 1)}
          >
            ›
          </button>
        </div>

        <div className="home-carousel-dots" aria-label="Elegir lugar del carrusel">
          {LANDMARK_SLIDES.map((item, index) => (
            <button
              key={item.title}
              className={index === activeSlide ? "active" : ""}
              aria-label={`Mostrar ${item.title}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="home-games" aria-label="Juegos disponibles">
        <div className="home-games-header">
          <span className="home-section-kicker">Elegí un modo</span>
          <h2>¿Qué querés jugar?</h2>
        </div>
        <div className="game-cards">
          <button className="game-card flagle-card" onClick={() => onSelect(SCREENS.FLAGLE)}>
            <span className="game-card-emoji">🚩</span>
            <span className="game-card-tag">Pixels</span>
            <h3 className="game-card-title">Flagle</h3>
            <p className="game-card-desc">
              Adiviná el país a partir de su bandera. Cada intento revela más píxeles.
            </p>
            <span className="game-card-cta">Jugar</span>
          </button>
          <button className="game-card globle-card" onClick={() => onSelect(SCREENS.GLOBLE)}>
            <span className="game-card-emoji">🌍</span>
            <span className="game-card-tag">Mapa 3D</span>
            <h3 className="game-card-title">Globle</h3>
            <p className="game-card-desc">
              Encontrá el país misterioso con pistas de distancia y cercanía.
            </p>
            <span className="game-card-cta">Jugar</span>
          </button>
          <button className="game-card choice-card" onClick={() => onSelect(SCREENS.FLAG_CHOICE)}>
            <span className="game-card-emoji">🎌</span>
            <span className="game-card-tag">Quiz</span>
            <h3 className="game-card-title">Flag Choice</h3>
            <p className="game-card-desc">
              Mirá una bandera y elegí el país correcto entre cuatro opciones.
            </p>
            <span className="game-card-cta">Jugar</span>
          </button>
        </div>
      </section>

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
