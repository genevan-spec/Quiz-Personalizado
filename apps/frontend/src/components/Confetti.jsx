import PropTypes from 'prop-types';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#f97316', '#14b8a6'];

// Gerado uma vez no módulo — as peças de confetti não precisam de mudar entre renders
const PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i / 40) * 100 + (Math.random() - 0.5) * 5}%`,
  color: COLORS[i % COLORS.length],
  delay: `${(Math.random() * 1.5).toFixed(2)}s`,
  duration: `${(2 + Math.random() * 2).toFixed(2)}s`,
  width: `${6 + Math.floor(Math.random() * 8)}px`,
  height: `${8 + Math.floor(Math.random() * 8)}px`,
  rotate: `${Math.floor(Math.random() * 360)}deg`,
  shape: i % 3 === 0 ? 'circle' : 'rect',
}));

/**
 * Chuva de confetti em CSS puro, sem dependências externas.
 * Apenas renderiza quando `active` é true.
 */
function Confetti({ active }) {
  const pieces = PIECES;

  if (!active) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`confetti-piece confetti-piece--${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.width,
            height: p.height,
            '--rotate': p.rotate,
          }}
        />
      ))}
    </div>
  );
}

Confetti.propTypes = {
  active: PropTypes.bool.isRequired,
};

export default Confetti;
