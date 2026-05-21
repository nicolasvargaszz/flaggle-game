export default function AnswerOptions({ options, selectedCode, getOptionClass, onChoice }) {
  return (
    <div className="flag-choice-options">
      {options.map((country, index) => (
        <button
          key={country.code3}
          className={`flag-choice-option ${getOptionClass(country)}`}
          disabled={Boolean(selectedCode)}
          onClick={() => onChoice(country)}
        >
          <span className="flag-choice-option-letter">
            {String.fromCharCode(65 + index)}
          </span>
          <span>{country.name}</span>
        </button>
      ))}
    </div>
  );
}
