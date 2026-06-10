import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

/**
 * Modal de autenticação com dois modos: Login | Registo
 * Props:
 *   onClose  — callback ao fechar
 *   initial  — 'login' | 'register'
 */
function AuthModal({ onClose, initial = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode]       = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Campos
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const firstInputRef = useRef(null);
  const overlayRef    = useRef(null);

  // Focar primeiro input ao abrir
  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message ?? 'Erro desconhecido. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setMode(next);
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* ── Fechar ───────────────────────────────────────────────── */}
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* ── Título ───────────────────────────────────────────────── */}
        <h2 id="auth-modal-title" className="modal-title">
          {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
        </h2>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Registo
          </button>
        </div>

        {/* ── Formulário ───────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-username">Nome de utilizador</label>
              <input
                ref={mode === 'register' ? firstInputRef : null}
                id="auth-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: Smilley"
                minLength={3}
                maxLength={50}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              ref={mode === 'login' ? firstInputRef : null}
              id="auth-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : ''}
              minLength={mode === 'register' ? 8 : 1}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* ── Erro ─────────────────────────────────────────────── */}
          {error && (
            <p className="auth-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? 'A processar…'
              : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {/* ── Link alternativo ──────────────────────────────────────── */}
        <p className="auth-switch">
          {mode === 'login'
            ? <>Ainda não tens conta?{' '}<button type="button" className="auth-link" onClick={() => switchMode('register')}>Regista-te</button></>
            : <>Já tens conta?{' '}<button type="button" className="auth-link" onClick={() => switchMode('login')}>Faz login</button></>
          }
        </p>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  initial: PropTypes.oneOf(['login', 'register']),
};

export default AuthModal;
