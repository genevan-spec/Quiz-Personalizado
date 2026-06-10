import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Página não encontrada · Quiz de Cultura Geral</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="placeholder-page" role="main" aria-labelledby="not-found-heading">
        <span className="placeholder-page__icon" aria-hidden="true">🔍</span>
        <h1 id="not-found-heading">404 — Página não encontrada</h1>
        <p>A página que procuras não existe ou foi movida.</p>
        <Link to="/" className="btn btn-primary" aria-label="Voltar à página inicial do Quiz">
          Voltar ao início
        </Link>
      </main>
    </>
  );
}

export default NotFoundPage;
