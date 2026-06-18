import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('../../lib/api', () => ({
  api: { post: jest.fn() },
}));

import { api } from '../../lib/api';

// Pequeno componente de teste para expor o contexto via hooks
function Probe() {
  const { user, isLoggedIn, login, register, logout, submitScore } = useAuth();
  return (
    <div>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="username">{user?.username ?? ''}</span>
      <button onClick={() => login('u@test.com', 'password123')}>login</button>
      <button onClick={() => register('Smilley', 'smilley@test.com', 'password123')}>register</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => submitScore(8, 10, 'geral')}>submit-score</button>
    </div>
  );
}

function renderProbe() {
  return render(<AuthProvider><Probe /></AuthProvider>);
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('starts logged out when there is no stored user', () => {
    renderProbe();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  });

  it('logs in successfully and persists user/token to localStorage', async () => {
    api.post.mockResolvedValueOnce({
      token: 'tok-123',
      user: { id: 1, username: 'Smilley', email: 'u@test.com' },
    });
    renderProbe();

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('username')).toHaveTextContent('Smilley');
    expect(localStorage.getItem('quiz_token')).toBe('tok-123');
    expect(JSON.parse(localStorage.getItem('quiz_user')).username).toBe('Smilley');
  });

  it('registers successfully and updates context', async () => {
    api.post.mockResolvedValueOnce({
      token: 'tok-456',
      user: { id: 2, username: 'Smilley', email: 'smilley@test.com' },
    });
    renderProbe();

    await act(async () => {
      screen.getByText('register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('Smilley');
    });
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      username: 'Smilley', email: 'smilley@test.com', password: 'password123',
    });
  });

  it('logs out and clears localStorage', async () => {
    api.post.mockResolvedValueOnce({
      token: 'tok-789',
      user: { id: 3, username: 'Smilley', email: 'u@test.com' },
    });
    renderProbe();

    await act(async () => { screen.getByText('login').click(); });
    await waitFor(() => expect(screen.getByTestId('logged-in')).toHaveTextContent('true'));

    act(() => { screen.getByText('logout').click(); });

    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
    expect(localStorage.getItem('quiz_token')).toBeNull();
    expect(localStorage.getItem('quiz_user')).toBeNull();
  });

  it('submitScore returns null when not authenticated', async () => {
    let result;
    function Capture() {
      const { submitScore } = useAuth();
      return <button onClick={async () => { result = await submitScore(5, 10, 'geral'); }}>go</button>;
    }
    render(<AuthProvider><Capture /></AuthProvider>);

    await act(async () => { screen.getByText('go').click(); });

    expect(result).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('throws a helpful error when useAuth is used outside <AuthProvider>', () => {
    const BrokenProbe = () => { useAuth(); return null; };
    // Silencia o erro esperado do React no console durante este teste
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<BrokenProbe />)).toThrow(/useAuth deve ser usado dentro/);
    spy.mockRestore();
  });
});
