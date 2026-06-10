import { createContext, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import allQuestions from '../data/questions';

const QuizContext = createContext(null);

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MAX_QUESTIONS = Number(import.meta.env.VITE_MAX_QUESTIONS) || 20;

// eslint-disable-next-line react-refresh/only-export-components
export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz deve ser usado dentro de <QuizProvider>');
  return ctx;
}

export function QuizProvider({ children }) {
  const [playerName, setPlayerName] = useState('Anónimo');
  const [theme, setTheme] = useState('classic');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lifelinesUsed, setLifelinesUsed] = useState({ fiftyFifty: false, skip: false });

  const startQuiz = useCallback(({ name, category, limit, theme: selectedTheme }) => {
    setPlayerName(name || 'Anónimo');
    setTheme(selectedTheme);
    setLifelinesUsed({ fiftyFifty: false, skip: false });
    setCurrentQuestion(0);
    setScore(0);

    const filtered =
      category === 'todas'
        ? allQuestions
        : category === 'geral'
          ? allQuestions.filter(
              (q) => q.category !== 'Angola 🇦🇴' && q.category !== 'África 🌍'
            )
          : allQuestions.filter((q) => q.category === category);

    const cap = Math.min(limit, MAX_QUESTIONS, filtered.length);
    setQuizQuestions(shuffleArray(filtered).slice(0, cap));
  }, []);

  const answerQuestion = useCallback((isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);
  }, []);

  const advanceQuestion = useCallback(() => {
    setCurrentQuestion((prev) => prev + 1);
  }, []);

  const activateFiftyFifty = useCallback(() => {
    setLifelinesUsed((prev) => ({ ...prev, fiftyFifty: true }));
  }, []);

  const activateSkip = useCallback(() => {
    setLifelinesUsed((prev) => ({ ...prev, skip: true }));
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizQuestions([]);
    setLifelinesUsed({ fiftyFifty: false, skip: false });
  }, []);

  return (
    <QuizContext.Provider
      value={{
        playerName,
        theme,
        quizQuestions,
        currentQuestion,
        score,
        lifelinesUsed,
        startQuiz,
        answerQuestion,
        advanceQuestion,
        activateFiftyFifty,
        activateSkip,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

QuizProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

