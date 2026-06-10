import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from '../AuthModal';
import { AuthProvider } from '../../context/AuthContext';

// Stub api module so tests don't hit a real server
vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from '../../lib/api';

function renderModal(props = {}) {
  return render(
    <AuthProvider>
      <AuthModal onClose={vi.fn()} {...props} />
    </AuthProvider>
  );
}

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Login tab as active by default', () => {
    renderModal();
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders register tab when initial="register"', () => {
    renderModal({ initial: 'register' });
    expect(screen.getByRole('tab', { name: /registo/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/nome de utilizador/i)).toBeInTheDocument();
  });

  it('switches to register tab on click', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('tab', { name: /registo/i }));
    expect(screen.getByLabelText(/nome de utilizador/i)).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows API error when login fails', async () => {
    api.post.mockRejectedValueOnce(new Error('Credenciais inválidas'));
    renderModal();

    await userEvent.type(screen.getByLabelText(/email/i), 'fail@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas');
  });

  it('calls onClose after successful login', async () => {
    const onClose = vi.fn();
    api.post.mockResolvedValueOnce({ token: 'tok', user: { id: 1, username: 'u', email: 'u@test.com' } });
    renderModal({ onClose });

    await userEvent.type(screen.getByLabelText(/email/i), 'u@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
