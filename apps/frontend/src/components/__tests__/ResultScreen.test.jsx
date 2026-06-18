import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import ResultScreen from '../ResultScreen';

// react-hot-toast requer DOM real para o Toaster — stub para simplificar
jest.mock('react-hot-toast', () => {
  const actual = jest.requireActual('react-hot-toast');
  return { ...actual, Toaster: () => null };
});

const BASE_PROPS = {
  playerName: 'Smilley',
  score: 8,
  total: 10,
  lifelinesUsed: { fiftyFifty: false, skip: true },
  maxStreak: 4,
  totalTimeMs: 45000,
  onRestart: jest.fn(),
};

describe('ResultScreen', () => {
  it('renders player name', () => {
    render(<ResultScreen {...BASE_PROPS} />);
    expect(screen.getByText(/smilley/i)).toBeInTheDocument();
  });

  it('displays total correctly', () => {
    render(<ResultScreen {...BASE_PROPS} />);
    // "/10" aparece na área de pontuação animada
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
    const onRestart = jest.fn();
    render(<ResultScreen {...BASE_PROPS} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: /jogar novamente/i }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
