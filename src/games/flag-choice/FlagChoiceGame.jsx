import { useEffect, useMemo, useRef, useState } from "react";
import countries from "../../data/countries.js";
import GameLayout from "../../../gamelayout.jsx";
import AnswerOptions from "./AnswerOptions.jsx";
import FlagChoiceHeader from "./FlagChoiceHeader.jsx";
import FlagQuestionCard from "./FlagQuestionCard.jsx";
import LevelProgress from "./LevelProgress.jsx";
import {
  LEVELS,
  createFlagChoiceRound,
  getLevelFromScore,
  getLevelProgress,
} from "./flagChoiceUtils.js";
import "./flagChoice.css";

const OPTION_COUNT = 4;
const FEEDBACK_DELAY = 700;

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

  const gameState = gameOver
    ? "gameOver"
    : levelUpName
      ? "levelUp"
      : feedback ?? "idle";

  return (
    <GameLayout title="Flag Choice" emoji="🎌" onBack={onBack} className="flag-choice-layout">
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
        <section className={`flag-choice-shell ${gameState}`}>
          <FlagChoiceHeader currentLevel={currentLevel} lives={lives} score={score} />
          <LevelProgress currentLevel={currentLevel} progress={progress} />
          <FlagQuestionCard
            targetCountry={round.target}
            feedback={feedback}
            levelUpName={levelUpName}
          />
          <AnswerOptions
            options={round.options}
            selectedCode={selectedCode}
            getOptionClass={getOptionClass}
            onChoice={handleChoice}
          />
        </section>
      )}
    </GameLayout>
  );
}
