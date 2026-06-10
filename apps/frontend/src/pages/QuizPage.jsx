import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import { useQuiz } from '../context/QuizContext';

function QuizPage() {
  const {
    quizQuestions,
    currentQuestion,
    streak,
    lifelinesUsed,
    answerQuestion,
    advanceQuestion,
    activateFiftyFifty,
    activateSkip,
    finishQuiz,
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
        finishQuiz();
        navigate('/resultados');
      } else {
        advanceQuestion();
      }
    }, 2000);
  };

  const handleSkip = () => {
    activateSkip();
    if (isLastQuestion) {
      finishQuiz();
      navigate('/resultados');
    } else {
      advanceQuestion();
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Pergunta ${currentQuestion + 1} / ${quizQuestions.length} — Quiz`}</title>
      </Helmet>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(30, 20, 50, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
        }}
      />

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
        streak={streak}
      />
    </>
  );
}

export default QuizPage;
