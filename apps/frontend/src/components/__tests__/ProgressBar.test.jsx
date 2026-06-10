import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders the correct question label', () => {
    render(<ProgressBar current={2} total={10} />);
    expect(screen.getByText('Pergunta 3 de 10')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<ProgressBar current={5} total={10} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('sets progressbar aria attributes', () => {
    render(<ProgressBar current={4} total={10} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('starts at 0% on question 0', () => {
    render(<ProgressBar current={0} total={10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
