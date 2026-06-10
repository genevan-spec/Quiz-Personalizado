import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultScreen from '../ResultScreen';

// react-hot-toast requires a DOM — stub Toaster
vi.mock('react-hot-toast', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, Toaster: () => null };
});

const BASE_PROPS = {
  playerName: 'Smilley',
  score: 8,
  total: 10,
  lifelinesUsed: { fiftyFifty: false, skip: true },
  maxStreak: 4,
  totalTimeMs: 45000,
  onRestart: vi.fn(),
};

describe('ResultScreen', () => {
  it('renders player name', () => {
    render(<ResultScreen {...BASE_PROPS} />);
    expect(screen.getByText(/smilley/i)).toBeInTheDocument();
  });

  it('displays total correctly', () => {
    render(<ResultScreen {...BASE_PROPS} />);
    // "/10" appears in the animated score area
    expect(screen.getByText('/10')).toBeInTheDocument();
  });

  it('shows restart button', () => {
    render(<ResultScreen {...BASE_PROPS} />);
    expect(screen.getByRole('button', { name: /jogar novamente/i })).toBeInTheDocument();
  });

  it('shows "guardar score" CTA when not logged in', () => {
    render(<ResultScreen {...BASE_PROPS} isLoggedIn={false} />);
    expect(screen.getByRole('button', { name: /guardar score/i })).toBeInTheDocument();
  });

  it('shows saved badge when scoreSaved=true', () => {
    render(<ResultScreen {...BASE_PROPS} isLoggedIn scoreSaved />);
    expect(screen.getByText(/score guardado/i)).toBeInTheDocument();
  });

  it('calls onRestart when button is clicked', async () => {
    const onRestart = vi.fn();
    const { getByRole } = render(<ResultScreen {...BASE_PROPS} onRestart={onRestart} />);
    const { userEvent } = await import('@testing-library/user-event');
    await userEvent.click(getByRole('button', { name: /jogar novamente/i }));
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
