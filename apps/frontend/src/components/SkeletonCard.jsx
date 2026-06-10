import PropTypes from 'prop-types';

/**
 * Skeleton placeholder — exibido durante transições de ecrã
 * e carregamentos futuros de dados remotos (Fase 3+).
 *
 * Variantes:
 *  - "question" (default) — simula o QuestionCard
 *  - "leaderboard" — simula linhas de tabela
 */
function SkeletonCard({ variant = 'question', rows = 4 }) {
  if (variant === 'leaderboard') {
    return (
      <div className="skeleton skeleton--leaderboard" aria-busy="true" aria-label="A carregar leaderboard…">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton__row">
            <span className="skeleton__block skeleton__block--rank" />
            <span className="skeleton__block skeleton__block--name" />
            <span className="skeleton__block skeleton__block--score" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton skeleton--question" aria-busy="true" aria-label="A carregar pergunta…">
      {/* Cabeçalho: badge de categoria + botões de ajuda */}
      <div className="skeleton__header">
        <span className="skeleton__block skeleton__block--badge" />
        <div className="skeleton__lifelines">
          <span className="skeleton__block skeleton__block--btn" />
          <span className="skeleton__block skeleton__block--btn" />
          <span className="skeleton__block skeleton__block--btn" />
        </div>
      </div>

      {/* Texto da pergunta */}
      <span className="skeleton__block skeleton__block--title" />
      <span className="skeleton__block skeleton__block--title skeleton__block--title-short" />

      {/* Opções de resposta */}
      <div className="skeleton__options">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="skeleton__block skeleton__block--option" />
        ))}
      </div>
    </div>
  );
}

SkeletonCard.propTypes = {
  variant: PropTypes.oneOf(['question', 'leaderboard']),
  rows: PropTypes.number,
};

export default SkeletonCard;
