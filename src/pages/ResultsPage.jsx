import { useNavigate } from 'react-router-dom';
import ResultScreen from '../components/ResultScreen';
import { useQuiz } from '../context/QuizContext';

function ResultsPage() {
  const { playerName, score, quizQuestions, lifelinesUsed, resetQuiz } = useQuiz();
  const navigate = useNavigate();

  const handleRestart = () => {
    resetQuiz();
    navigate('/');
  };

  if (quizQuestions.length === 0) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <ResultScreen
      playerName={playerName}
      score={score}
      total={quizQuestions.length}
      lifelinesUsed={lifelinesUsed}
      onRestart={handleRestart}
    />
  );
}

export default ResultsPage;
