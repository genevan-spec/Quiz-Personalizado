import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders title and start button', () => {
    render(<WelcomeScreen onStart={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /quiz de cultura geral/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /começar/i })).toBeInTheDocument();
  });

  it('calls onStart with trimmed name when submitted', async () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    await userEvent.type(screen.getByLabelText(/o teu nome/i), '  Smilley  ');
    await userEvent.click(screen.getByRole('button', { name: /começar/i }));

    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Smilley' })
    );
  });

  it('falls back to "Anónimo" when name is blank', async () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    await userEvent.click(screen.getByRole('button', { name: /começar/i }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Anónimo' })
    );
  });

  it('renders all category options', () => {
    render(<WelcomeScreen onStart={vi.fn()} />);
    const select = screen.getByLabelText(/categoria/i);
    expect(select).toBeInTheDocument();
    expect(select.options).toHaveLength(4); // todas, Angola, África, geral
  });

  it('passes selected theme and limit to onStart', async () => {
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    await userEvent.selectOptions(screen.getByLabelText(/tema visual/i), 'angola');
    await userEvent.selectOptions(screen.getByLabelText(/nº de perguntas/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /começar/i }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'angola', limit: 5 })
    );
  });
});
