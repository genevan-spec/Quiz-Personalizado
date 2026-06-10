import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import SkeletonCard from '../components/SkeletonCard';
import AuthModal from '../components/AuthModal';

const MEDALS = ['🥇', '🥈', '🥉'];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'agora';
  if (m < 60) return `há ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function LeaderboardPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [modalMode,   setModalMode]   = useState('login');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/leaderboard');
      setEntries(data);
    } catch (err) {
      setError(err.message ?? 'Não foi possível carregar o leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const openModal = (mode = 'login') => { setModalMode(mode); setShowModal(true); };

  return (
    <>
      <Helmet>
        <title>Leaderboard — Quiz de Cultura Geral</title>
        <meta name="description" content="Os melhores resultados do Quiz de Cultura Geral." />
      </Helmet>

      {showModal && (
        <AuthModal
          initial={modalMode}
          onClose={() => { setShowModal(false); fetchLeaderboard(); }}
        />
      )}

      <section className="leaderboard-page" aria-labelledby="lb-heading">

        {/* ── Cabeçalho ───────────────────────────────────────────── */}
        <div className="lb-header">
          <h1 id="lb-heading" className="lb-title">
            <span aria-hidden="true">🏆</span> Leaderboard
          </h1>

          {isLoggedIn ? (
            <div className="lb-user-bar">
              <span className="lb-user-greeting">Olá, <strong>{user.username}</strong>!</span>
              <button
                type="button"
                className="btn-ghost"
                onClick={logout}
                aria-label="Terminar sessão"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="lb-auth-cta">
              <button type="button" className="btn-ghost" onClick={() => openModal('login')}>
                Login
              </button>
              <button type="button" className="btn-primary lb-register-btn" onClick={() => openModal('register')}>
                Criar conta
              </button>
            </div>
          )}
        </div>

        {/* ── Corpo ───────────────────────────────────────────────── */}
        {loading && <SkeletonCard variant="leaderboard" rows={8} />}

        {!loading && error && (
          <div className="lb-error" role="alert">
            <p>{error}</p>
            <button type="button" className="btn-ghost" onClick={fetchLeaderboard}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="lb-empty">
            <span aria-hidden="true">📭</span>
            <p>Ainda não há scores registados.</p>
            <p>Completa um quiz e cria conta para aparecer aqui!</p>
            <Link to="/" className="btn-primary">Jogar agora</Link>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            {!isLoggedIn && (
              <p className="lb-login-nudge">
                <button type="button" className="auth-link" onClick={() => openModal('register')}>
                  Cria conta
                </button>
                {' '}para guardar os teus scores e aparecer aqui.
              </p>
            )}

            <div className="lb-refresh-row">
              <button
                type="button"
                className="btn-ghost lb-refresh"
                onClick={fetchLeaderboard}
                aria-label="Actualizar leaderboard"
              >
                ↻ Actualizar
              </button>
            </div>

            <div className="lb-table-wrapper">
              <table className="lb-table" aria-label="Top 10 melhores scores">
                <thead>
                  <tr>
                    <th scope="col" abbr="Posição">#</th>
                    <th scope="col">Jogador</th>
                    <th scope="col">Score</th>
                    <th scope="col">%</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr
                      key={e.rank}
                      className={`lb-row${e.username === user?.username ? ' lb-row--mine' : ''}`}
                      aria-label={`Posição ${e.rank}: ${e.username}, ${e.score} de ${e.total}, ${e.percentage}%`}
                    >
                      <td className="lb-rank">
                        {e.rank <= 3
                          ? <span aria-hidden="true">{MEDALS[e.rank - 1]}</span>
                          : e.rank
                        }
                      </td>
                      <td className="lb-username">
                        {e.username}
                        {e.username === user?.username && (
                          <span className="lb-you-badge" aria-label="(tu)"> tu</span>
                        )}
                      </td>
                      <td className="lb-score">{e.score}/{e.total}</td>
                      <td className="lb-pct">
                        <span
                          className={`lb-pct-badge ${e.percentage >= 80 ? 'lb-pct--high' : e.percentage >= 50 ? 'lb-pct--mid' : 'lb-pct--low'}`}
                        >
                          {e.percentage}%
                        </span>
                      </td>
                      <td className="lb-category">{e.category}</td>
                      <td className="lb-date" title={new Date(e.date).toLocaleString('pt')}>
                        {timeAgo(e.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default LeaderboardPage;

