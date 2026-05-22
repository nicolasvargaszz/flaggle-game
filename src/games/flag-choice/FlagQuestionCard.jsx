export default function FlagQuestionCard({ targetCountry, feedback }) {
  const feedbackText = feedback?.type ?? "idle";

  return (
    <section className={`flag-question-card ${feedbackText}`}>
      <div className="flag-choice-flag-frame">
        <img
          key={targetCountry.code3}
          src={targetCountry.flagPng ?? targetCountry.flagSvg}
          alt="Bandera para adivinar"
          className="flag-choice-flag"
          onError={(event) => {
            if (targetCountry.flagSvg && event.currentTarget.src !== targetCountry.flagSvg) {
              event.currentTarget.src = targetCountry.flagSvg;
            }
          }}
        />
      </div>

      <div className={`flag-choice-feedback ${feedbackText}`} aria-live="polite">
        {feedback?.type === "correct" && (
          <>
            <strong>Correcto</strong>
            <span>{targetCountry.name} · +{feedback.points} puntos</span>
            {feedback.bonus > 0 && <span>Bonus racha +{feedback.bonus}</span>}
          </>
        )}
        {feedback?.type === "wrong" && (
          <>
            <strong>Incorrecto</strong>
            <span>La respuesta era: {targetCountry.name}</span>
          </>
        )}
        {!feedback && "¿Qué país tiene esta bandera?"}
      </div>
    </section>
  );
}
