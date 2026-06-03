/**
 * ============================================
 * COMPONENTE: Barra de Progresso
 * ============================================
 * 
 * Mostra o progresso do utilizador no quiz.
 * A barra preenche gradualmente à medida que as perguntas são respondidas.
 * 
 * Props:
 * - current: número da pergunta atual (ex: 3)
 * - total: número total de perguntas (ex: 10)
 */

function ProgressBar({ current, total }) {
  // Calcula a percentagem de progresso
  const percentage = ((current) / total) * 100;

  return (
    <div className="progress-container">
      {/* Texto do progresso */}
      <div className="progress-text">
        <span>Pergunta {current + 1} de {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>

      {/* Barra visual */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
