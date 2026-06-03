import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import ResultScreen from './components/ResultScreen';
import allQuestions from './data/questions';
import './App.css';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function App() {
  const [screen, setScreen] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('Anónimo');
  const [theme, setTheme] = useState('classic');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [lifelinesUsed, setLifelinesUsed] = useState({ fiftyFifty: false, skip: false });

  const startQuiz = ({ name, category, limit, theme: selectedTheme }) => {
    setPlayerName(name);
    setTheme(selectedTheme);
    setLifelinesUsed({ fiftyFifty: false, skip: false });

    let filtered = [];
    if (category === 'todas') {
      filtered = allQuestions;
    } else if (category === 'geral') {
      filtered = allQuestions.filter(
        (q) => q.category !== 'Angola 🇦🇴' && q.category !== 'África 🌍'
      );
    } else {
      filtered = allQuestions.filter((q) => q.category === category);
    }

    const finalQuestions = shuffleArray(filtered).slice(0, Math.min(limit, filtered.length));

    setQuizQuestions(finalQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setScreen('quiz');
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);
    advanceQuiz();
  };

  const advanceQuiz = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setScreen('result');
    }
  };

  const useFiftyFifty = () => {
    setLifelinesUsed((prev) => ({ ...prev, fiftyFifty: true }));
  };

  const useSkip = () => {
    setLifelinesUsed((prev) => ({ ...prev, skip: true }));
    advanceQuiz();
  };

  const restartQuiz = () => {
    setScreen('welcome');
    setCurrentQuestion(0);
    setScore(0);
  };

  return (
    <div className={`app theme-${theme}`}>
      <div className="bg-decoration">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <main className="quiz-container">
        {screen === 'welcome' && (
          <WelcomeScreen onStart={startQuiz} />
        )}

        {screen === 'quiz' && quizQuestions.length > 0 && (
          <>
            <ProgressBar
              current={currentQuestion}
              total={quizQuestions.length}
            />

            <QuestionCard
              key={`${currentQuestion}-${quizQuestions[currentQuestion].id}`}
              question={quizQuestions[currentQuestion]}
              onAnswer={handleAnswer}
              questionNumber={currentQuestion + 1}
              lifelinesUsed={lifelinesUsed}
              onUseFiftyFifty={useFiftyFifty}
              onUseSkip={useSkip}
            />
          </>
        )}

        {screen === 'result' && (
          <ResultScreen
            playerName={playerName}
            score={score}
            total={quizQuestions.length}
            lifelinesUsed={lifelinesUsed}
            onRestart={restartQuiz}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Feito por Smilley 🇦🇴</p>
      </footer>
    </div>
  );
}

export default App;
