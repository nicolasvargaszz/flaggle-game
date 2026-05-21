export default function FlagQuestionCard({ targetCountry, feedback }) {
  const feedbackText = feedback?.type ?? "idle";

  return (
    <section className={`flag-question-card ${feedbackText}`}>
      <div className="flag-choice-flag-frame">
        <img
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
            Correcto: <strong>{targetCountry.name}</strong>
            <span>
              +{feedback.points} puntos
              {feedback.bonus > 0 && <> · bonus racha +{feedback.bonus}</>}
            </span>
          </>
        )}
        {feedback?.type === "wrong" && <>Era <strong>{targetCountry.name}</strong></>}
        {!feedback && "¿Qué país tiene esta bandera?"}
      </div>
    </section>
  );
}
