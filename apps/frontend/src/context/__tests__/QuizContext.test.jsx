import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { QuizProvider, useQuiz } from '../QuizContext';

// Banco de perguntas controlado e determinístico para os testes
jest.mock('../../data/questions', () => ([
  { id: 1, question: 'Q1', options: ['a', 'b'], correctAnswer: 0, category: 'Angola 🇦🇴' },
  { id: 2, question: 'Q2', options: ['a', 'b'], correctAnswer: 0, category: 'Angola 🇦🇴' },
  { id: 3, question: 'Q3', options: ['a', 'b'], correctAnswer: 0, category: 'África 🌍' },
  { id: 4, question: 'Q4', options: ['a', 'b'], correctAnswer: 0, category: 'Ciência' },
  { id: 5, question: 'Q5', options: ['a', 'b'], correctAnswer: 0, category: 'Ciência' },
]));

let api;
function Probe() {
  api = useQuiz();
  return (
    <div>
      <span data-testid="count">{api.quizQuestions.length}</span>
      <span data-testid="current">{api.currentQuestion}</span>
      <span data-testid="score">{api.score}</span>
      <span data-testid="streak">{api.streak}</span>
      <span data-testid="maxStreak">{api.maxStreak}</span>
      <span data-testid="player">{api.playerName}</span>
    </div>
  );
}

function renderProbe() {
  return render(<QuizProvider><Probe /></QuizProvider>);
}

describe('QuizContext', () => {
  beforeEach(() => { api = undefined; });

  it('filters questions by exact category', () => {
    renderProbe();
    act(() => {
      api.startQuiz({ name: 'Smilley', category: 'Angola 🇦🇴', limit: 10, theme: 'classic' });
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('includes everything for category "todas"', () => {
    renderProbe();
    act(() => {
      api.startQuiz({ name: 'Smilley', category: 'todas', limit: 10, theme: 'classic' });
    });
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  it('excludes Angola/África for category "geral"', () => {
    renderProbe();
    act(() => {
      api.startQuiz({ name: 'Smilley', category: 'geral', limit: 10, theme: 'classic' });
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2'); // só as 2 de Ciência
  });

  it('caps the number of questions to the requested limit', () => {
    renderProbe();
    act(() => {
      api.startQuiz({ name: 'Smilley', category: 'todas', limit: 3, theme: 'classic' });
    });
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('defaults the player name to "Anónimo" when blank', () => {
    renderProbe();
    act(() => {
      api.startQuiz({ name: '', category: 'todas', limit: 10, theme: 'classic' });
    });
    expect(screen.getByTestId('player')).toHaveTextContent('Anónimo');
  });

  it('increments score and streak on correct answers', () => {
    renderProbe();
    act(() => { api.startQuiz({ name: 'S', category: 'todas', limit: 10, theme: 'classic' }); });

    act(() => { api.answerQuestion(true); });
    act(() => { api.answerQuestion(true); });

    expect(screen.getByTestId('score')).toHaveTextContent('2');
    expect(screen.getByTestId('streak')).toHaveTextContent('2');
    expect(screen.getByTestId('maxStreak')).toHaveTextContent('2');
  });

  it('resets streak (but keeps maxStreak) on a wrong answer', () => {
    renderProbe();
    act(() => { api.startQuiz({ name: 'S', category: 'todas', limit: 10, theme: 'classic' }); });

    act(() => { api.answerQuestion(true); });
    act(() => { api.answerQuestion(true); });
    act(() => { api.answerQuestion(false); });

    expect(screen.getByTestId('streak')).toHaveTextContent('0');
    expect(screen.getByTestId('maxStreak')).toHaveTextContent('2');
  });

  it('advances to the next question', () => {
    renderProbe();
    act(() => { api.startQuiz({ name: 'S', category: 'todas', limit: 10, theme: 'classic' }); });
    act(() => { api.advanceQuestion(); });
    expect(screen.getByTestId('current')).toHaveTextContent('1');
  });

  it('resetQuiz clears questions, score and current index', () => {
    renderProbe();
    act(() => { api.startQuiz({ name: 'S', category: 'todas', limit: 10, theme: 'classic' }); });
    act(() => { api.answerQuestion(true); api.advanceQuestion(); });
    act(() => { api.resetQuiz(); });

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('current')).toHaveTextContent('0');
    expect(screen.getByTestId('score')).toHaveTextContent('0');
  });

  it('throws a helpful error when useQuiz is used outside <QuizProvider>', () => {
    const Broken = () => { useQuiz(); return null; };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Broken />)).toThrow(/useQuiz deve ser usado dentro/);
    spy.mockRestore();
  });
});
