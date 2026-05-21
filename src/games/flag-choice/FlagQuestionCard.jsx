export default function FlagQuestionCard({ targetCountry, feedback, levelUpName }) {
  const feedbackText = feedback ?? "idle";

  return (
    <section className={`flag-question-card ${feedbackText}`}>
      <div className="flag-choice-flag-frame">
        <img
          src={targetCountry.flagPng}
          alt="Bandera para adivinar"
          className="flag-choice-flag"
        />
      </div>

      <div className={`flag-choice-feedback ${feedbackText}`} aria-live="polite">
        {feedback === "correct" && (
          <>
            Correcto: <strong>{targetCountry.name}</strong>
            {levelUpName && <> · Subiste a <strong>{levelUpName}</strong></>}
          </>
        )}
        {feedback === "wrong" && <>Era <strong>{targetCountry.name}</strong></>}
        {!feedback && "¿Qué país tiene esta bandera?"}
      </div>
    </section>
  );
}
