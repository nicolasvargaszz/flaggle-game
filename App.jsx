import { useState } from "react";
import FlagleGame from "./Flaglegame.jsx";
import GlobleGame from "./Globegame.jsx";
import "./style.css";

const SCREENS = { HOME: "home", FLAGLE: "flagle", GLOBLE: "globle" };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  if (screen === SCREENS.FLAGLE) return <FlagleGame onBack={() => setScreen(SCREENS.HOME)} />;
  if (screen === SCREENS.GLOBLE) return <GlobleGame onBack={() => setScreen(SCREENS.HOME)} />;
  return <HomeScreen onSelect={setScreen} />;
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
