import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Temporizador visual circular por pergunta.
 * Muda de cor: verde → amarelo (≤10s) → vermelho pulsante (≤5s).
 * Quando chega a zero chama `onTimeUp`.
 */
function QuestionTimer({ duration = 30, onTimeUp, paused = false }) {
  const [remaining, setRemaining] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset quando a pergunta muda (duration prop muda ou componente remonta)
  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (paused || remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [paused, remaining]);

  const pct = remaining / duration;
  const offset = CIRCUMFERENCE * (1 - pct);
  const urgency = remaining <= 5 ? 'critical' : remaining <= 10 ? 'warning' : 'normal';

  return (
    <div
      className={`question-timer question-timer--${urgency}`}
      role="timer"
      aria-label={`Tempo restante: ${remaining} segundos`}
    >
      <svg viewBox="0 0 50 50" className="timer-svg" aria-hidden="true">
        <circle cx="25" cy="25" r={RADIUS} className="timer-track" />
        <circle
          cx="25" cy="25" r={RADIUS}
          className="timer-progress"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 25 25)"
        />
      </svg>
      <span className="timer-number" aria-live="off">
        {remaining}
      </span>
    </div>
  );
}

QuestionTimer.propTypes = {
  duration: PropTypes.number,
  onTimeUp: PropTypes.func,
  paused: PropTypes.bool,
};

export default QuestionTimer;
