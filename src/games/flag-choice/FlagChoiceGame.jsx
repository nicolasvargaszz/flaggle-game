import { useEffect, useMemo, useRef, useState } from "react";
import countries from "../../data/countries.js";
import GameLayout from "../../../gamelayout.jsx";
import {
  LEVELS,
  createFlagChoiceRound,
  getLevelFromScore,
  getLevelProgress,
} from "./flagChoiceUtils.js";

const OPTION_COUNT = 4;
const FEEDBACK_DELAY = 950;

export default function FlagChoiceGame({ onBack }) {
  const initialLevel = LEVELS[0];
  const [round, setRound] = useState(() => createFlagChoiceRound(countries, initialLevel, [], OPTION_COUNT));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLevel.lives);
  const [usedCountryCodes, setUsedCountryCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [levelUpName, setLevelUpName] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const timersRef = useRef([]);

  const currentLevel = useMemo(() => getLevelFromScore(score), [score]);
  const progress = useMemo(() => getLevelProgress(score), [score]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function queue(callback) {
    const timer = setTimeout(callback, FEEDBACK_DELAY);
    timersRef.current.push(timer);
  }

  function startNextRound(nextScore, nextUsedCodes) {
    const nextLevel = getLevelFromScore(nextScore);
    setRound(createFlagChoiceRound(countries, nextLevel, nextUsedCodes, OPTION_COUNT));
    setUsedCountryCodes(nextUsedCodes);
    setSelectedCode(null);
    setFeedback(null);
    setLevelUpName(null);
  }

  function restart() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRound(createFlagChoiceRound(countries, initialLevel, [], OPTION_COUNT));
    setScore(0);
    setLives(initialLevel.lives);
    setUsedCountryCodes([]);
    setSelectedCode(null);
    setFeedback(null);
    setLevelUpName(null);
    setGameOver(false);
  }

  function handleChoice(country) {
    if (selectedCode || gameOver) return;

    const isCorrect = country.code3 === round.target.code3;
    const nextUsedCodes = [...usedCountryCodes, round.target.code3];

    setSelectedCode(country.code3);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const nextScore = score + 1;
      const nextLevel = getLevelFromScore(nextScore);
      const didLevelUp = nextLevel.id !== currentLevel.id;

      setScore(nextScore);
      if (didLevelUp) {
        setLives(nextLevel.lives);
        setLevelUpName(nextLevel.name);
      }

      queue(() => startNextRound(nextScore, nextUsedCodes));
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);

    queue(() => {
      if (nextLives <= 0) {
        setUsedCountryCodes(nextUsedCodes);
        setGameOver(true);
        return;
      }
      startNextRound(score, nextUsedCodes);
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
          <p>
            Nivel alcanzado: <strong>{currentLevel.name}</strong>
          </p>
          <button className="btn btn-primary" onClick={restart}>
            Reiniciar
          </button>
        </section>
      ) : (
        <section className="flag-choice-shell">
          <div className="flag-choice-stats">
            <span className="stat-pill">Puntos {score}</span>
            <span className="stat-pill">Nivel {currentLevel.difficulty}: {currentLevel.name}</span>
            <span className="flag-choice-lives" aria-label={`${lives} vidas`}>
              {Array.from({ length: currentLevel.lives }, (_, index) => (
                <span key={index} className={index < lives ? "" : "empty"}>
                  🌍
                </span>
              ))}
            </span>
          </div>

          <div className="flag-choice-level-card">
            <div>
              <strong>{currentLevel.name}</strong>
              <p>{currentLevel.description}</p>
            </div>
            <div className="flag-choice-progress">
              <span>
                {progress.isMaxLevel
                  ? "Nivel máximo"
                  : `${progress.current}/${progress.required} para avanzar`}
              </span>
              <div className="flag-choice-progress-track">
                <div
                  className="flag-choice-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
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
              {feedback === "correct" && (
                <>
                  Correcto: <strong>{round.target.name}</strong>
                  {levelUpName && <> · Subiste a <strong>{levelUpName}</strong></>}
                </>
              )}
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
