import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '../components/WelcomeScreen';
import { useQuiz } from '../context/QuizContext';

function HomePage() {
  const { startQuiz } = useQuiz();
  const navigate = useNavigate();

  const handleStart = (options) => {
    startQuiz(options);
    navigate('/quiz');
  };

  return <WelcomeScreen onStart={handleStart} />;
}

export default HomePage;
