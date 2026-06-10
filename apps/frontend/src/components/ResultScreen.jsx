import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Confetti from './Confetti';

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function formatTime(ms) {
  if (!ms) return null;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function ResultScreen({ playerName, score, total, lifelinesUsed, maxStreak, totalTimeMs, scoreSaved, isLoggedIn, onRestart, onSaveScore }) {
  const percentage = Math.round((score / total) * 100);
  const displayScore = useCountUp(score);
  const displayPct   = useCountUp(percentage);
  const showConfetti = percentage >= 80;

  const getMessage = () => {
    if (percentage === 100) return { text: 'Impressionante! Acertaste tudo na perfeição!', emoji: '🏆' };
    if (percentage >= 80)  return { text: 'Excelente conhecimento! Estás de parabéns!', emoji: '🌟' };
    if (percentage >= 50)  return { text: 'Bom trabalho! Tiveste um desempenho positivo!', emoji: '💪' };
    return { text: 'Boa tentativa! Estuda mais um pouco e volta a tentar!', emoji: '📚' };
  };

  const message = getMessage();

  const handleShare = async () => {
    const text = `Acabei o Quiz de Cultura Geral com ${percentage}% de aproveitamento (${score}/${total})! 🧠 Tenta tu também!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Quiz de Cultura Geral', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Resultado copiado para a área de transferência!', { duration: 3000 });
    }
  };

  return (
    <main className="result-screen" aria-labelledby="result-heading">
      <Confetti active={showConfetti} />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(30, 20, 50, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />

      <div className="result-emoji" aria-hidden="true">{message.emoji}</div>

      <h1 id="result-heading" className="result-title">Quiz Concluído!</h1>

      <p className="result-welcome">
        Parabéns, <span>{playerName}</span>!
      </p>

      {/* ── Círculo de pontuação animado ─────────────────────────── */}
      <div
        className="score-circle"
        role="img"
        aria-label={`Pontuação: ${score} de ${total} — ${percentage}% de aproveitamento`}
      >
        <svg viewBox="0 0 120 120" className="score-svg" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 3.27} 327`}
            transform="rotate(-90 60 60)"
            className="score-progress"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="score-text" aria-hidden="true">
          <span className="score-number">{displayScore}</span>
          <span className="score-divider">/{total}</span>
        </div>
      </div>

      <div className="score-percentage">{displayPct}% de Aproveitamento</div>
      <p className="result-message">{message.text}</p>

      {/* ── Estatísticas ─────────────────────────────────────────── */}
      <div className="result-stats-grid" role="list" aria-label="Estatísticas do jogo">
        <div className="stat-card" role="listitem">
          <span className="stat-icon" aria-hidden="true">🔥</span>
          <span className="stat-value">{maxStreak}</span>
          <span className="stat-label">Melhor streak</span>
        </div>
        <div className="stat-card" role="listitem">
          <span className="stat-icon" aria-hidden="true">⚖️</span>
          <span className="stat-value">{lifelinesUsed.fiftyFifty ? 'Usado' : '—'}</span>
          <span className="stat-label">50/50</span>
        </div>
        <div className="stat-card" role="listitem">
          <span className="stat-icon" aria-hidden="true">⏭️</span>
          <span className="stat-value">{lifelinesUsed.skip ? 'Usado' : '—'}</span>
          <span className="stat-label">Pulo</span>
        </div>
        {totalTimeMs > 0 && (
          <div className="stat-card" role="listitem">
            <span className="stat-icon" aria-hidden="true">⏱️</span>
            <span className="stat-value">{formatTime(totalTimeMs)}</span>
            <span className="stat-label">Tempo total</span>
          </div>
        )}
      </div>

      {/* ── Score CTA ────────────────────────────────────────────── */}
      <div className="result-score-cta" aria-live="polite">
        {isLoggedIn && scoreSaved && (
          <p className="score-saved-badge">
            <span aria-hidden="true">✅</span> Score guardado no leaderboard!
          </p>
        )}
        {isLoggedIn && !scoreSaved && (
          <p className="score-saving-badge">
            <span className="score-saving-spinner" aria-hidden="true" /> A guardar score…
          </p>
        )}
        {!isLoggedIn && (
          <button
            type="button"
            className="btn-save-score"
            onClick={onSaveScore}
            aria-label="Faz login ou cria conta para guardar o teu score no leaderboard"
          >
            <span aria-hidden="true">🔑</span> Guardar score no leaderboard
          </button>
        )}
      </div>

      {/* ── Ações ────────────────────────────────────────────────── */}
      <div className="result-actions">
        <button
          id="restart-quiz-btn"
          className="btn-primary"
          onClick={onRestart}
          aria-label="Jogar novamente"
        >
          <span aria-hidden="true">🔄</span> Jogar Novamente
        </button>

        <button
          className="btn-secondary"
          onClick={handleShare}
          aria-label="Partilhar resultado"
        >
          <span aria-hidden="true">📤</span> Partilhar
        </button>
      </div>
    </main>
  );
}

ResultScreen.propTypes = {
  playerName:   PropTypes.string.isRequired,
  score:        PropTypes.number.isRequired,
  total:        PropTypes.number.isRequired,
  lifelinesUsed: PropTypes.shape({
    fiftyFifty: PropTypes.bool.isRequired,
    skip:       PropTypes.bool.isRequired,
  }).isRequired,
  maxStreak:   PropTypes.number,
  totalTimeMs: PropTypes.number,
  scoreSaved:  PropTypes.bool,
  isLoggedIn:  PropTypes.bool,
  onRestart:   PropTypes.func.isRequired,
  onSaveScore: PropTypes.func,
};

ResultScreen.defaultProps = {
  maxStreak:   0,
  totalTimeMs: 0,
  scoreSaved:  false,
  isLoggedIn:  false,
  onSaveScore: () => {},
};

export default ResultScreen;



