import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
    <>
      <Helmet>
        <title>Resultados de {playerName} — Quiz de Cultura Geral</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <ResultScreen
        playerName={playerName}
        score={score}
        total={quizQuestions.length}
        lifelinesUsed={lifelinesUsed}
        onRestart={handleRestart}
      />
    </>
  );
}

export default ResultsPage;
