import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import { useQuiz } from '../context/QuizContext';

function QuizPage() {
  const {
    quizQuestions,
    currentQuestion,
    lifelinesUsed,
    answerQuestion,
    advanceQuestion,
    activateFiftyFifty,
    activateSkip,
  } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (quizQuestions.length === 0) {
      navigate('/', { replace: true });
    }
  }, [quizQuestions, navigate]);

  if (quizQuestions.length === 0) return null;

  const isLastQuestion = currentQuestion >= quizQuestions.length - 1;

  const handleAnswer = (isCorrect) => {
    answerQuestion(isCorrect);
    setTimeout(() => {
      if (isLastQuestion) {
        navigate('/resultados');
      } else {
        advanceQuestion();
      }
    }, 2000);
  };

  const handleSkip = () => {
    activateSkip();
    if (isLastQuestion) {
      navigate('/resultados');
    } else {
      advanceQuestion();
    }
  };

  return (
    <>
      <ProgressBar
        current={currentQuestion}
        total={quizQuestions.length}
      />
      <QuestionCard
        key={`${currentQuestion}-${quizQuestions[currentQuestion].id}`}
        question={quizQuestions[currentQuestion]}
        onAnswer={handleAnswer}
        lifelinesUsed={lifelinesUsed}
        onUseFiftyFifty={activateFiftyFifty}
        onUseSkip={handleSkip}
      />
    </>
  );
}

export default QuizPage;
