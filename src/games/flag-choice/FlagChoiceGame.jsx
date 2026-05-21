import { useEffect, useRef, useState } from "react";
import countries from "../../data/countries.js";
import GameLayout from "../../../gamelayout.jsx";
import { createFlagChoiceRound } from "./flagChoiceUtils.js";

const MAX_LIVES = 3;
const OPTION_COUNT = 4;
const FEEDBACK_DELAY = 950;

export default function FlagChoiceGame({ onBack }) {
  const [round, setRound] = useState(() => createFlagChoiceRound(countries, null, OPTION_COUNT));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [selectedCode, setSelectedCode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function queue(callback) {
    const timer = setTimeout(callback, FEEDBACK_DELAY);
    timersRef.current.push(timer);
  }

  function startNextRound() {
    setRound(prevRound => createFlagChoiceRound(countries, prevRound.target.code3, OPTION_COUNT));
    setSelectedCode(null);
    setFeedback(null);
  }

  function restart() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRound(createFlagChoiceRound(countries, round.target.code3, OPTION_COUNT));
    setScore(0);
    setLives(MAX_LIVES);
    setSelectedCode(null);
    setFeedback(null);
    setGameOver(false);
  }

  function handleChoice(country) {
    if (selectedCode || gameOver) return;

    const isCorrect = country.code3 === round.target.code3;
    const nextLives = isCorrect ? lives : lives - 1;

    setSelectedCode(country.code3);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) setScore(currentScore => currentScore + 1);
    if (!isCorrect) setLives(nextLives);

    queue(() => {
      if (nextLives <= 0) {
        setGameOver(true);
        return;
      }
      startNextRound();
    });
  }

  function getOptionClass(country) {
    if (!selectedCode) return "";
    if (country.code3 === round.target.code3) return "correct";
    if (country.code3 === selectedCode) return "wrong";
    return "muted";
  }

  return (
    <GameLayout title="Flag Choice" emoji="🎌" onBack={onBack}>
      {gameOver ? (
        <section className="flag-choice-end">
          <div className="flag-choice-end-icon">🌍</div>
          <h3>Game Over</h3>
          <p>
            Llegaste a <strong>{score}</strong> respuesta{score !== 1 ? "s" : ""} correcta{score !== 1 ? "s" : ""}.
          </p>
          <button className="btn btn-primary" onClick={restart}>
            Reiniciar
          </button>
        </section>
      ) : (
        <section className="flag-choice-shell">
          <div className="flag-choice-stats">
            <span className="stat-pill">Puntos {score}</span>
            <span className="flag-choice-lives" aria-label={`${lives} vidas`}>
              {Array.from({ length: MAX_LIVES }, (_, index) => (
                <span key={index} className={index < lives ? "" : "empty"}>
                  🌍
                </span>
              ))}
            </span>
          </div>

          <div className="flag-choice-card">
            <div className="flag-choice-flag-frame">
              <img
                src={round.target.flagPng}
                alt="Bandera para adivinar"
                className="flag-choice-flag"
              />
            </div>

            <div className={`flag-choice-feedback ${feedback ?? ""}`} aria-live="polite">
              {feedback === "correct" && <>Correcto: <strong>{round.target.name}</strong></>}
              {feedback === "wrong" && <>Incorrecto. Era <strong>{round.target.name}</strong></>}
              {!feedback && "Elegí el país correcto"}
            </div>

            <div className="flag-choice-options">
              {round.options.map(country => (
                <button
                  key={country.code3}
                  className={`flag-choice-option ${getOptionClass(country)}`}
                  disabled={Boolean(selectedCode)}
                  onClick={() => handleChoice(country)}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </GameLayout>
  );
}
