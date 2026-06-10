import { useState } from 'react';
import PropTypes from 'prop-types';

function QuestionCard({
  question,
  onAnswer,
  lifelinesUsed,
  onUseFiftyFifty,
  onUseSkip
}) {
  const [selectedOption, setSelectedOption] = useState(-1);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);

  const handleFiftyFiftyClick = () => {
    if (lifelinesUsed.fiftyFifty || answered) return;

    const incorrectIndexes = question.options
      .map((_, i) => i)
      .filter(i => i !== question.correctAnswer);

    const toEliminate = incorrectIndexes
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    setEliminatedOptions(toEliminate);
    onUseFiftyFifty();
  };

  const handleOptionClick = (index) => {
    if (answered) return;

    setSelectedOption(index);
    setAnswered(true);

    const isCorrect = index === question.correctAnswer;

    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2000);
  };

  const getOptionClass = (index) => {
    if (eliminatedOptions.includes(index)) return 'hidden-by-lifeline';
    if (!answered) return '';
    if (index === question.correctAnswer) {
      return index === selectedOption ? 'selected correct' : 'correct-reveal';
    }
    if (index === selectedOption) return 'selected wrong';
    return 'disabled';
  };

  return (
    <div className="question-card">
      <div className="card-header-row">
        <span className="category-badge">{question.category}</span>
        
        <div className="lifelines-container">
          <button
            type="button"
            className="lifeline-btn"
            onClick={() => setShowHint(true)}
            disabled={showHint || answered}
            title="Mostrar dica"
          >
            💡 Dica
          </button>

          <button
            type="button"
            className="lifeline-btn"
            onClick={handleFiftyFiftyClick}
            disabled={lifelinesUsed.fiftyFifty || answered}
            title="Eliminar duas opções erradas"
          >
            ⚖️ 50/50 {lifelinesUsed.fiftyFifty && <span className="lifeline-badge">usado</span>}
          </button>

          <button
            type="button"
            className="lifeline-btn"
            onClick={onUseSkip}
            disabled={lifelinesUsed.skip || answered}
            title="Passar à próxima"
          >
            ⏭️ Saltar {lifelinesUsed.skip && <span className="lifeline-badge">usado</span>}
          </button>
        </div>
      </div>

      {showHint && question.hint && (
        <div className="hint-box">
          <span className="hint-icon">💡</span>
          <p><strong>Dica:</strong> {question.hint}</p>
        </div>
      )}

      <h2 className="question-text">{question.question}</h2>

      <div className="options-grid">
        {question.options.map((option, index) => {
          const isEliminated = eliminatedOptions.includes(index);
          return (
            <button
              key={index}
              id={`option-${index}`}
              className={`option-btn ${getOptionClass(index)}`}
              onClick={() => handleOptionClick(index)}
              disabled={answered || isEliminated}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`explanation ${selectedOption === question.correctAnswer ? 'correct' : 'wrong'}`}>
          <span className="explanation-icon">
            {selectedOption === question.correctAnswer ? '✅' : '❌'}
          </span>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.number.isRequired,
    explanation: PropTypes.string,
    hint: PropTypes.string,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onAnswer: PropTypes.func.isRequired,
  lifelinesUsed: PropTypes.shape({
    fiftyFifty: PropTypes.bool.isRequired,
    skip: PropTypes.bool.isRequired,
  }).isRequired,
  onUseFiftyFifty: PropTypes.func.isRequired,
  onUseSkip: PropTypes.func.isRequired,
};

export default QuestionCard;
