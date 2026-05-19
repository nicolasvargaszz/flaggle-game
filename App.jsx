import { Suspense, lazy, useState } from "react";
import "./style.css";

const FlagleGame = lazy(() => import("./Flaglegame.jsx"));
const GlobleGame = lazy(() => import("./Globegame.jsx"));
const SCREENS = { HOME: "home", FLAGLE: "flagle", GLOBLE: "globle" };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  if (screen === SCREENS.FLAGLE) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <FlagleGame onBack={() => setScreen(SCREENS.HOME)} />
      </Suspense>
    );
  }
  if (screen === SCREENS.GLOBLE) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <GlobleGame onBack={() => setScreen(SCREENS.HOME)} />
      </Suspense>
    );
  }
  return <HomeScreen onSelect={setScreen} />;
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
