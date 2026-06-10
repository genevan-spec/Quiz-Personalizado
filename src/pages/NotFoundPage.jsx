import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="placeholder-page">
      <span className="placeholder-page__icon">🔍</span>
      <h2>404 — Página não encontrada</h2>
      <p>A página que procuras não existe.</p>
      <Link to="/" className="btn btn-primary">
        Voltar ao início
      </Link>
    </div>
  );
}

export default NotFoundPage;
