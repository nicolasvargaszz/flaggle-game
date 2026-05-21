export default function LevelProgress({ currentLevel, progress }) {
  return (
    <section className="flag-choice-level-card">
      <div>
        <span className="flag-choice-level-kicker">Nivel actual</span>
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
    </section>
  );
}
