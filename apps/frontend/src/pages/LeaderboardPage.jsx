import { Helmet } from 'react-helmet-async';

function LeaderboardPage() {
  return (
    <>
      <Helmet>
        <title>Leaderboard — Quiz de Cultura Geral</title>
        <meta name="description" content="Os melhores resultados do Quiz de Cultura Geral." />
      </Helmet>
      <div className="placeholder-page" role="main" aria-label="Leaderboard">
        <span className="placeholder-page__icon" aria-hidden="true">🏆</span>
        <h2>Leaderboard</h2>
        <p>Em breve — disponível na Fase 5 com backend integrado.</p>
      </div>
    </>
  );
}

export default LeaderboardPage;
