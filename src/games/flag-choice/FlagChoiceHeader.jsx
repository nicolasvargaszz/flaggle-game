export default function FlagChoiceHeader({ currentLevel, lives, score }) {
  return (
    <div className="flag-choice-mobile-header">
      <div className="flag-choice-header-stat" aria-label={`${lives} vidas`}>
        <span className="flag-choice-header-label">Vidas</span>
        <span className="flag-choice-heart-row">
          {Array.from({ length: currentLevel.lives }, (_, index) => (
            <span key={index} className={index < lives ? "" : "empty"}>
              🌍
            </span>
          ))}
        </span>
      </div>

      <div className="flag-choice-level-badge">
        <span>Nivel {currentLevel.difficulty}</span>
        <strong>{currentLevel.name}</strong>
      </div>

      <div className="flag-choice-header-stat right">
        <span className="flag-choice-header-label">Score</span>
        <strong>{score}</strong>
      </div>
    </div>
  );
}
