import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import WelcomeScreen from '../components/WelcomeScreen';
import { useQuiz } from '../context/QuizContext';

function HomePage() {
  const { startQuiz } = useQuiz();
  const navigate = useNavigate();

  const handleStart = (options) => {
    startQuiz(options);
    navigate('/quiz');
  };

  return (
    <>
      <Helmet>
        <title>Quiz de Cultura Geral — Início</title>
        <meta name="description" content="Testa os teus conhecimentos sobre Angola, África e cultura geral. Escolhe a categoria e começa o quiz!" />
      </Helmet>
      <WelcomeScreen onStart={handleStart} />
    </>
  );
}

export default HomePage;
