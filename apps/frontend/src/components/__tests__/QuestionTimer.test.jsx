import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import QuestionTimer from '../QuestionTimer';

describe('QuestionTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts showing the full duration', () => {
    render(<QuestionTimer duration={30} onTimeUp={jest.fn()} />);
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', 'Tempo restante: 30 segundos');
  });

  it('counts down every second', () => {
    render(<QuestionTimer duration={10} onTimeUp={jest.fn()} />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onTimeUp when it reaches zero', () => {
    const onTimeUp = jest.fn();
    render(<QuestionTimer duration={3} onTimeUp={onTimeUp} />);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('does not count down while paused', () => {
    render(<QuestionTimer duration={10} onTimeUp={jest.fn()} paused />);
    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies the critical urgency class when time is low', () => {
    render(<QuestionTimer duration={5} onTimeUp={jest.fn()} />);
    act(() => { jest.advanceTimersByTime(1000); }); // remaining = 4
    expect(screen.getByRole('timer')).toHaveClass('question-timer--critical');
  });
});
