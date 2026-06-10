import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import ResultScreen from '../components/ResultScreen';
import AuthModal from '../components/AuthModal';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';

function ResultsPage() {
  const { playerName, score, quizQuestions, lifelinesUsed, maxStreak, totalTimeMs, resetQuiz } = useQuiz();
  const { isLoggedIn, submitScore } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scoreSaved,    setScoreSaved]    = useState(false);

  // Detectar categoria (única ou 'todas' se mista)
  const category = quizQuestions.length > 0 && quizQuestions.every(
    (q) => q.category === quizQuestions[0].category
  ) ? quizQuestions[0].category : 'todas';

  // Auto-save ao montar se autenticado
  useEffect(() => {
    if (!isLoggedIn || quizQuestions.length === 0 || scoreSaved) return;

    submitScore(score, quizQuestions.length, category)
      .then(() => {
        setScoreSaved(true);
        toast.success('🏆 Score guardado no leaderboard!', { duration: 3500 });
      })
      .catch(() => {
        toast.error('Não foi possível guardar o score.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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

      {showAuthModal && (
        <AuthModal
          initial="register"
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <ResultScreen
        playerName={playerName}
        score={score}
        total={quizQuestions.length}
        lifelinesUsed={lifelinesUsed}
        maxStreak={maxStreak}
        totalTimeMs={totalTimeMs}
        scoreSaved={scoreSaved}
        isLoggedIn={isLoggedIn}
        onRestart={handleRestart}
        onSaveScore={() => setShowAuthModal(true)}
      />
    </>
  );
}

export default ResultsPage;

