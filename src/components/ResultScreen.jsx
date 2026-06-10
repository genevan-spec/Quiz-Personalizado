/**
 * ============================================
 * COMPONENTE: Ecrã de Resultados
 * ============================================
 * 
 * Exibe a pontuação final personalizada para o utilizador,
 * com o seu nome, percentagem, estatísticas das ajudas
 * utilizadas e botão para tentar novamente.
 * 
 * Props:
 * - playerName: nome introduzido pelo utilizador
 * - score: total de acertos
 * - total: total de perguntas jogadas
 * - lifelinesUsed: registo das ajudas gastas durante o jogo
 * - onRestart: callback para recomeçar o quiz
 */
import PropTypes from 'prop-types';

function ResultScreen({ playerName, score, total, lifelinesUsed, onRestart }) {
  const percentage = Math.round((score / total) * 100);

  /**
   * Mensagem e emoji motivacional dependente do resultado
   */
  const getMessage = () => {
    if (percentage === 100) return { text: "Impressionante! Acertou tudo de forma perfeita!", emoji: "🏆" };
    if (percentage >= 80) return { text: "Excelente conhecimento! Está de parabéns!", emoji: "🌟" };
    if (percentage >= 50) return { text: "Bom trabalho! Teve um desempenho positivo!", emoji: "💪" };
    return { text: "Boa tentativa! Estuda mais um pouco e volta a tentar!", emoji: "📚" };
  };

  const message = getMessage();

  return (
    <main className="result-screen" aria-labelledby="result-heading">
      <div className="result-emoji" aria-hidden="true">{message.emoji}</div>

      <h1 id="result-heading" className="result-title">Quiz Concluído!</h1>
      
      {/* Saudação Personalizada */}
      <p className="result-welcome">
        Parabéns, <span>{playerName}</span>!
      </p>

      {/* Círculo Gráfico de Pontuação */}
      <div
        className="score-circle"
        role="img"
        aria-label={`Pontuação: ${score} de ${total} — ${percentage}% de aproveitamento`}
      >
        <svg viewBox="0 0 120 120" className="score-svg" aria-hidden="true">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
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
          <span className="score-number">{score}</span>
          <span className="score-divider">/{total}</span>
        </div>
      </div>

      <div className="score-percentage">{percentage}% de Aproveitamento</div>
      <p className="result-message">{message.text}</p>

      {/* Resumo de Ajudas Usadas */}
      <div className="result-stats-summary" role="list" aria-label="Ajudas utilizadas">
        <span className="result-stat-badge" role="listitem">
          <span aria-hidden="true">⚖️</span> 50/50: {lifelinesUsed.fiftyFifty ? "Usado" : "Não Usado"}
        </span>
        <span className="result-stat-badge" role="listitem">
          <span aria-hidden="true">⏭️</span> Pulo: {lifelinesUsed.skip ? "Usado" : "Não Usado"}
        </span>
      </div>

      <button
        id="restart-quiz-btn"
        className="btn-primary"
        onClick={onRestart}
        aria-label="Jogar novamente"
      >
        Jogar Novamente <span aria-hidden="true">🔄</span>
      </button>
    </main>
  );
}

ResultScreen.propTypes = {
  playerName: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  lifelinesUsed: PropTypes.shape({
    fiftyFifty: PropTypes.bool.isRequired,
    skip: PropTypes.bool.isRequired,
  }).isRequired,
  onRestart: PropTypes.func.isRequired,
};

export default ResultScreen;
