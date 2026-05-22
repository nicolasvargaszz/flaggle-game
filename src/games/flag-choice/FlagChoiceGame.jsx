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
  getLevelProgress,
  getNextLevel,
  getStreakBonus,
  isFinalLevel,
} from "./flagChoiceUtils.js";
import "./flagChoice.css";

const OPTION_COUNT = 4;
const CORRECT_FEEDBACK_DELAY = 700;
const WRONG_FEEDBACK_DELAY = 1000;
const LEVEL_UP_DELAY = 1000;
const BASE_CORRECT_POINTS = 10;

function createInitialGameState() {
  const initialLevel = LEVELS[0];

  return {
    lives: initialLevel.lives,
    score: 0,
    streak: 0,
    bestStreak: 0,
    currentLevel: initialLevel,
    correctAnswersInCurrentLevel: 0,
    totalQuestionsAnswered: 0,
    usedCountries: [],
    failedCountry: null,
    gameStatus: "playing",
  };
}

export default function FlagChoiceGame({ onBack }) {
  const initialLevel = LEVELS[0];
  const [hasStarted, setHasStarted] = useState(false);
  const [game, setGame] = useState(() => createInitialGameState());
  const [round, setRound] = useState(() => createFlagChoiceRound(countries, initialLevel, [], OPTION_COUNT));
  const [selectedCode, setSelectedCode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const timersRef = useRef([]);
  const answerLockedRef = useRef(false);

  const progress = useMemo(
    () => getLevelProgress(game.currentLevel, game.correctAnswersInCurrentLevel),
    [game.currentLevel, game.correctAnswersInCurrentLevel]
  );

  useEffect(() => {
    return () => clearQueuedTimers();
  }, []);

  function clearQueuedTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function queue(callback, delay) {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
  }

  function resetQuestionState() {
    answerLockedRef.current = false;
    setSelectedCode(null);
    setFeedback(null);
    setLevelUpInfo(null);
  }

  function startNextRound(nextGame) {
    setRound(createFlagChoiceRound(
      countries,
      nextGame.currentLevel,
      nextGame.usedCountries,
      OPTION_COUNT
    ));
    setGame({
      ...nextGame,
      gameStatus: "playing",
    });
    resetQuestionState();
  }

  function restart() {
    clearQueuedTimers();
    answerLockedRef.current = false;
    const nextGame = createInitialGameState();
    setRound(createFlagChoiceRound(countries, nextGame.currentLevel, [], OPTION_COUNT));
    setGame(nextGame);
    setHasStarted(true);
    resetQuestionState();
  }

  function startGame() {
    restart();
  }

  function handleCorrectAnswer(nextUsedCountries) {
    const nextStreak = game.streak + 1;
    const streakBonus = getStreakBonus(nextStreak);
    const pointsEarned = BASE_CORRECT_POINTS + streakBonus;
    const nextCorrectAnswers = game.correctAnswersInCurrentLevel + 1;
    const shouldLevelUp = !isFinalLevel(game.currentLevel)
      && nextCorrectAnswers >= game.currentLevel.questionsToAdvance;
    const feedbackGame = {
      ...game,
      score: game.score + pointsEarned,
      streak: nextStreak,
      bestStreak: Math.max(game.bestStreak, nextStreak),
      correctAnswersInCurrentLevel: nextCorrectAnswers,
      totalQuestionsAnswered: game.totalQuestionsAnswered + 1,
      usedCountries: nextUsedCountries,
      gameStatus: "feedback",
    };

    setGame(feedbackGame);
    setFeedback({
      type: "correct",
      points: pointsEarned,
      bonus: streakBonus,
    });

    if (!shouldLevelUp) {
      queue(() => startNextRound(feedbackGame), CORRECT_FEEDBACK_DELAY);
      return;
    }

    const nextLevel = getNextLevel(game.currentLevel);
    const recoveredLives = Math.min(feedbackGame.lives + 1, nextLevel.lives);
    const levelUpGame = {
      ...feedbackGame,
      lives: recoveredLives,
      currentLevel: nextLevel,
      correctAnswersInCurrentLevel: 0,
      gameStatus: "levelUp",
    };

    queue(() => {
      setGame(levelUpGame);
      setFeedback(null);
      setSelectedCode(null);
      setLevelUpInfo({
        currentLevel: nextLevel,
        recoveredLife: recoveredLives > feedbackGame.lives,
        nextGame: levelUpGame,
      });
      queue(() => startNextRound(levelUpGame), LEVEL_UP_DELAY);
    }, CORRECT_FEEDBACK_DELAY);
  }

  function continueFromLevelUp() {
    if (game.gameStatus !== "levelUp" || !levelUpInfo?.nextGame) return;
    clearQueuedTimers();
    startNextRound(levelUpInfo.nextGame);
  }

  function handleWrongAnswer(nextUsedCountries) {
    const nextLives = Math.max(0, game.lives - 1);
    const feedbackGame = {
      ...game,
      lives: nextLives,
      streak: 0,
      totalQuestionsAnswered: game.totalQuestionsAnswered + 1,
      usedCountries: nextUsedCountries,
      failedCountry: nextLives <= 0 ? round.target : game.failedCountry,
      gameStatus: "feedback",
    };

    setGame(feedbackGame);
    setFeedback({ type: "wrong" });

    queue(() => {
      if (nextLives <= 0) {
        setGame({
          ...feedbackGame,
          gameStatus: "gameOver",
        });
        return;
      }

      startNextRound(feedbackGame);
    }, WRONG_FEEDBACK_DELAY);
  }

  function handleChoice(country) {
    if (answerLockedRef.current || game.gameStatus !== "playing" || !round?.target) return;

    const isCorrect = country.code3 === round.target.code3;
    const nextUsedCountries = [...game.usedCountries, round.target.code3];

    answerLockedRef.current = true;
    setSelectedCode(country.code3);

    if (isCorrect) {
      handleCorrectAnswer(nextUsedCountries);
      return;
    }

    handleWrongAnswer(nextUsedCountries);
  }

  function getOptionClass(country) {
    if (!selectedCode) return "";
    if (country.code3 === round.target.code3) return "correct";
    if (country.code3 === selectedCode) return "wrong";
    return "muted";
  }

  return (
    <GameLayout title="Flag Choice" emoji="🎌" onBack={onBack} className="flag-choice-layout">
      {!round?.target ? (
        <section className="flag-choice-end">
          <div className="flag-choice-end-icon">🎌</div>
          <h3>No hay países disponibles</h3>
          <p>Revisá que el dataset tenga países con bandera y código ISO.</p>
          <button className="btn btn-ghost" onClick={onBack}>
            Back to Menu
          </button>
        </section>
      ) : !hasStarted ? (
        <section className="flag-choice-start">
          <span className="flag-choice-start-kicker">Quiz de banderas</span>
          <h2>Flag Choice</h2>
          <p>
            Mirá la bandera, elegí el país correcto y subí de nivel con cada racha.
          </p>

          <div className="flag-choice-start-levels" aria-label="Niveles disponibles">
            {LEVELS.map(level => (
              <span key={level.id}>
                <strong>{level.difficulty}</strong>
                {level.name}
              </span>
            ))}
          </div>

          <button className="btn btn-primary flag-choice-start-btn" onClick={startGame}>
            Start
          </button>
        </section>
      ) : game.gameStatus === "gameOver" ? (
        <section className="flag-choice-end">
          <div className="flag-choice-end-icon">🌍</div>
          <h3>Game Over</h3>

          <div className="flag-choice-results">
            <span>
              Score final
              <strong>{game.score}</strong>
            </span>
            <span>
              Nivel alcanzado
              <strong>{game.currentLevel.name}</strong>
            </span>
            <span>
              Preguntas
              <strong>{game.totalQuestionsAnswered}</strong>
            </span>
            <span>
              Mejor racha
              <strong>{game.bestStreak}</strong>
            </span>
            <span>
              País fallado
              <strong>{game.failedCountry?.name ?? "Ninguno"}</strong>
            </span>
          </div>

          <div className="flag-choice-end-actions">
            <button className="btn btn-primary" onClick={restart}>
              Play Again
            </button>
            <button className="btn btn-ghost" onClick={onBack}>
              Back to Menu
            </button>
          </div>
        </section>
      ) : (
        <section className={`flag-choice-shell ${game.gameStatus}`}>
          <FlagChoiceHeader
            currentLevel={game.currentLevel}
            lives={game.lives}
            score={game.score}
            streak={game.streak}
          />
          <LevelProgress currentLevel={game.currentLevel} progress={progress} />

          {game.gameStatus === "levelUp" ? (
            <section className="flag-choice-level-up" aria-live="polite">
              <span>{levelUpInfo?.currentLevel.id === "dios" ? "Modo Dios" : "Level Up"}</span>
              <h3>Subiste a {levelUpInfo?.currentLevel.name}</h3>
              <p>
                {levelUpInfo?.currentLevel.id === "dios"
                  ? "Ahora solo aparecen países de dificultad Dios. Seguís jugando hasta perder."
                  : `Nueva dificultad: ${levelUpInfo?.currentLevel.difficulty}.`}
              </p>
              {levelUpInfo?.recoveredLife && <strong>Recuperaste 1 vida</strong>}
              <button className="btn btn-primary" onClick={continueFromLevelUp}>
                Continuar
              </button>
            </section>
          ) : (
            <>
              <FlagQuestionCard
                targetCountry={round.target}
                feedback={feedback}
              />
              <AnswerOptions
                options={round.options}
                selectedCode={selectedCode}
                getOptionClass={getOptionClass}
                onChoice={handleChoice}
              />
            </>
          )}
        </section>
      )}
    </GameLayout>
  );
}
