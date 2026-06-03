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
    <div className="result-screen">
      <div className="result-emoji">{message.emoji}</div>

      <h2 className="result-title">Quiz Concluído!</h2>
      
      {/* Saudação Personalizada */}
      <p className="result-welcome">
        Parabéns, <span>{playerName}</span>!
      </p>

      {/* Círculo Gráfico de Pontuação */}
      <div className="score-circle">
        <svg viewBox="0 0 120 120" className="score-svg">
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
        <div className="score-text">
          <span className="score-number">{score}</span>
          <span className="score-divider">/{total}</span>
        </div>
      </div>

      <div className="score-percentage">{percentage}% de Aproveitamento</div>
      <p className="result-message">{message.text}</p>

      {/* Resumo de Ajudas Usadas */}
      <div className="result-stats-summary">
        <span className="result-stat-badge">
          ⚖️ 50/50: {lifelinesUsed.fiftyFifty ? "Usado" : "Não Usado"}
        </span>
        <span className="result-stat-badge">
          ⏭️ Pulo: {lifelinesUsed.skip ? "Usado" : "Não Usado"}
        </span>
      </div>

      <button id="restart-quiz-btn" className="btn-primary" onClick={onRestart}>
        Jogar Novamente 🔄
      </button>
    </div>
  );
}

export default ResultScreen;
