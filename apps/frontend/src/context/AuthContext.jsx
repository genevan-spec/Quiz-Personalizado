import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '../lib/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

function loadStored() {
  try {
    const raw = localStorage.getItem('quiz_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(loadStored);
  const [token, setToken] = useState(() => localStorage.getItem('quiz_token'));

  const _persist = (tok, usr) => {
    localStorage.setItem('quiz_token', tok);
    localStorage.setItem('quiz_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const register = useCallback(async (username, email, password) => {
    const data = await api.post('/auth/register', { username, email, password });
    _persist(data.token, data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    _persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('quiz_user');
    setToken(null);
    setUser(null);
  }, []);

  /** Guarda o score no backend. Devolve o registo criado ou null se não autenticado. */
  const submitScore = useCallback(async (score, total, category) => {
    if (!token) return null;
    return api.post('/scores', { score, total, category });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        register,
        login,
        logout,
        submitScore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
