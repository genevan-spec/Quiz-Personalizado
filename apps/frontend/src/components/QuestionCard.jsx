import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import QuestionTimer from './QuestionTimer';

const TIMER_DURATION = 30; // segundos por pergunta

function QuestionCard({
  question,
  onAnswer,
  lifelinesUsed,
  onUseFiftyFifty,
  onUseSkip,
  streak,
}) {
  const [selectedOption, setSelectedOption] = useState(-1);
  const [answered, setAnswered] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const cardRef = useRef(null);

  // ── Handlers (declarados antes do useEffect que os usa) ─────────────────
  const handleFiftyFiftyClick = () => {
    if (lifelinesUsed.fiftyFifty || answered) return;

    const incorrectIndexes = question.options
      .map((_, i) => i)
      .filter((i) => i !== question.correctAnswer);

    const toEliminate = incorrectIndexes
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    setEliminatedOptions(toEliminate);
    onUseFiftyFifty();
    toast('⚖️ Duas opções erradas eliminadas!', { duration: 2500 });
  };

  const handleSkipClick = () => {
    if (lifelinesUsed.skip || answered) return;
    onUseSkip();
    toast('⏭️ Pergunta saltada!', { duration: 2000 });
  };

  const handleOptionClick = (index) => {
    if (answered || eliminatedOptions.includes(index)) return;

    setSelectedOption(index);
    setAnswered(true);

    const isCorrect = index === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 2000);
  };

  const handleTimeUp = () => {
    if (answered) return;
    setAnswered(true);
    setTimedOut(true);
    toast.error('⏰ Tempo esgotado!', { duration: 2500 });
    setTimeout(() => onAnswer(false), 2000);
  };

  const handleHintClick = () => {
    if (showHint || answered) return;
    setShowHint(true);
    toast('💡 Dica revelada!', { icon: '💡', duration: 2000 });
  };

  // ── Teclado ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      // Não interferir quando o foco está em inputs
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (answered) return;

      switch (e.key) {
        case '1': handleOptionClick(0); break;
        case '2': handleOptionClick(1); break;
        case '3': handleOptionClick(2); break;
        case '4': handleOptionClick(3); break;
        case 'h':
        case 'H':
          if (!showHint && question.hint) {
            setShowHint(true);
            toast('💡 Dica revelada!', { icon: '💡', duration: 2000 });
          }
          break;
        case 'f':
        case 'F':
          if (!lifelinesUsed.fiftyFifty) handleFiftyFiftyClick();
          break;
        case 's':
        case 'S':
          if (!lifelinesUsed.skip) handleSkipClick();
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, showHint, lifelinesUsed, question]);

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
    <div
      ref={cardRef}
      className="question-card question-card--enter"
      role="region"
      aria-label="Pergunta do quiz"
    >
      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div className="card-header-row">
        <div className="card-header-left">
          <span className="category-badge" aria-label={`Categoria: ${question.category}`}>
            {question.category}
          </span>
          {streak >= 2 && (
            <span className="streak-badge" aria-label={`Streak: ${streak} respostas corretas seguidas`}>
              🔥 {streak}
            </span>
          )}
        </div>

        <div className="card-header-right">
          <QuestionTimer
            key={question.id}
            duration={TIMER_DURATION}
            onTimeUp={handleTimeUp}
            paused={answered}
          />

          <div className="lifelines-container" role="group" aria-label="Ajudas disponíveis">
            <button
              type="button"
              className="lifeline-btn"
              onClick={handleHintClick}
              disabled={showHint || answered}
              aria-label="Mostrar dica (tecla H)"
              aria-pressed={showHint}
              title="Dica [H]"
            >
              <span aria-hidden="true">💡</span>
              <span className="lifeline-label">Dica</span>
              <kbd className="key-hint" aria-hidden="true">H</kbd>
            </button>

            <button
              type="button"
              className="lifeline-btn"
              onClick={handleFiftyFiftyClick}
              disabled={lifelinesUsed.fiftyFifty || answered}
              aria-label={lifelinesUsed.fiftyFifty ? 'Ajuda 50/50 já utilizada' : 'Eliminar duas opções (tecla F)'}
              aria-pressed={lifelinesUsed.fiftyFifty}
              title="50/50 [F]"
            >
              <span aria-hidden="true">⚖️</span>
              <span className="lifeline-label">50/50</span>
              {lifelinesUsed.fiftyFifty
                ? <span className="lifeline-badge" aria-hidden="true">✓</span>
                : <kbd className="key-hint" aria-hidden="true">F</kbd>
              }
            </button>

            <button
              type="button"
              className="lifeline-btn"
              onClick={handleSkipClick}
              disabled={lifelinesUsed.skip || answered}
              aria-label={lifelinesUsed.skip ? 'Ajuda saltar já utilizada' : 'Passar à próxima (tecla S)'}
              aria-pressed={lifelinesUsed.skip}
              title="Saltar [S]"
            >
              <span aria-hidden="true">⏭️</span>
              <span className="lifeline-label">Saltar</span>
              {lifelinesUsed.skip
                ? <span className="lifeline-badge" aria-hidden="true">✓</span>
                : <kbd className="key-hint" aria-hidden="true">S</kbd>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Dica ──────────────────────────────────────────────────────── */}
      {showHint && question.hint && (
        <div className="hint-box" role="note" aria-live="polite">
          <span className="hint-icon" aria-hidden="true">💡</span>
          <p><strong>Dica:</strong> {question.hint}</p>
        </div>
      )}

      {/* ── Pergunta ──────────────────────────────────────────────────── */}
      <h2 className="question-text" id="question-heading">{question.question}</h2>

      {/* ── Opções ────────────────────────────────────────────────────── */}
      <div className="options-grid" role="group" aria-labelledby="question-heading">
        {question.options.map((option, index) => {
          const isEliminated = eliminatedOptions.includes(index);
          const optClass = getOptionClass(index);
          const isCorrect = answered && index === question.correctAnswer;
          const isWrong = answered && index === selectedOption && index !== question.correctAnswer;
          return (
            <button
              key={index}
              id={`option-${index}`}
              className={`option-btn ${optClass}`}
              onClick={() => handleOptionClick(index)}
              disabled={answered || isEliminated}
              aria-disabled={answered || isEliminated}
              aria-label={`${String.fromCharCode(65 + index)}: ${option}${isEliminated ? ' — eliminada' : ''}${isCorrect ? ' — correta' : ''}${isWrong ? ' — errada' : ''}`}
            >
              <span className="option-letter" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
              <kbd className="option-key-hint" aria-hidden="true">{index + 1}</kbd>
            </button>
          );
        })}
      </div>

      {/* ── Explicação / Timeout ──────────────────────────────────────── */}
      {answered && (
        <div
          className={`explanation ${timedOut ? 'timeout' : selectedOption === question.correctAnswer ? 'correct' : 'wrong'}`}
          role="alert"
          aria-live="assertive"
        >
          <span className="explanation-icon" aria-hidden="true">
            {timedOut ? '⏰' : selectedOption === question.correctAnswer ? '✅' : '❌'}
          </span>
          <p>
            {timedOut
              ? `Tempo esgotado! A resposta correta era: ${question.options[question.correctAnswer]}`
              : question.explanation
            }
          </p>
        </div>
      )}

      {/* ── Atalhos de teclado (legenda) ──────────────────────────────── */}
      {!answered && (
        <p className="keyboard-hint sr-only" aria-live="polite">
          Atalhos: teclas 1–4 para selecionar, H para dica, F para 50/50, S para saltar.
        </p>
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
  streak: PropTypes.number,
};

QuestionCard.defaultProps = {
  streak: 0,
};

export default QuestionCard;

