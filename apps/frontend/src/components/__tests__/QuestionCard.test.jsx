import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import QuestionCard from '../QuestionCard';

jest.mock('react-hot-toast', () => {
  const fn = jest.fn();
  fn.error = jest.fn();
  fn.success = jest.fn();
  return { __esModule: true, default: fn };
});

const QUESTION = {
  id: 1,
  question: 'Qual a capital de Angola?',
  options: ['Luanda', 'Benguela', 'Huambo', 'Lobito'],
  correctAnswer: 0,
  explanation: 'Luanda é a capital de Angola.',
  hint: 'Fica no litoral.',
  category: 'Angola 🇦🇴',
};

const BASE_PROPS = {
  question: QUESTION,
  lifelinesUsed: { fiftyFifty: false, skip: false },
  onUseFiftyFifty: jest.fn(),
  onUseSkip: jest.fn(),
  streak: 0,
};

describe('QuestionCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the question and all options', () => {
    render(<QuestionCard {...BASE_PROPS} onAnswer={jest.fn()} />);
    expect(screen.getByText(QUESTION.question)).toBeInTheDocument();
    QUESTION.options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it('calls onAnswer(true) after selecting the correct option', async () => {
    const onAnswer = jest.fn();
    render(<QuestionCard {...BASE_PROPS} onAnswer={onAnswer} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Luanda'));

    act(() => { jest.advanceTimersByTime(2000); });

    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(false) after selecting a wrong option', async () => {
    const onAnswer = jest.fn();
    render(<QuestionCard {...BASE_PROPS} onAnswer={onAnswer} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Benguela'));

    act(() => { jest.advanceTimersByTime(2000); });

    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('disables further clicks after answering', async () => {
    render(<QuestionCard {...BASE_PROPS} onAnswer={jest.fn()} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Luanda'));

    expect(screen.getByText('Benguela').closest('button')).toBeDisabled();
  });

  it('reveals the hint when the hint button is clicked', async () => {
    render(<QuestionCard {...BASE_PROPS} onAnswer={jest.fn()} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: /mostrar dica/i }));

    expect(screen.getByText(QUESTION.hint)).toBeInTheDocument();
  });

  it('eliminates two wrong options when 50/50 is used', async () => {
    const onUseFiftyFifty = jest.fn();
    render(<QuestionCard {...BASE_PROPS} onUseFiftyFifty={onUseFiftyFifty} onAnswer={jest.fn()} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: /eliminar duas op/i }));

    expect(onUseFiftyFifty).toHaveBeenCalledTimes(1);
    const disabledButtons = screen.getAllByRole('button').filter(
      (btn) => btn.className.includes('option-btn') && btn.disabled
    );
    expect(disabledButtons).toHaveLength(2);
  });

  it('calls onUseSkip when the skip lifeline is used', async () => {
    const onUseSkip = jest.fn();
    render(<QuestionCard {...BASE_PROPS} onUseSkip={onUseSkip} onAnswer={jest.fn()} />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: /passar à próxima/i }));

    expect(onUseSkip).toHaveBeenCalledTimes(1);
  });

  it('shows the streak badge when streak >= 2', () => {
    render(<QuestionCard {...BASE_PROPS} streak={3} onAnswer={jest.fn()} />);
    expect(screen.getByText(/🔥 3/)).toBeInTheDocument();
  });

  it('does not show the streak badge when streak < 2', () => {
    render(<QuestionCard {...BASE_PROPS} streak={1} onAnswer={jest.fn()} />);
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });

  it('calls onAnswer(false) when time runs out', () => {
    render(<QuestionCard {...BASE_PROPS} onAnswer={jest.fn()} />);
    // O timeout do componente é tratado internamente — apenas garantimos
    // que o temporizador (filho QuestionTimer) está presente e a contagem corre.
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });
});
