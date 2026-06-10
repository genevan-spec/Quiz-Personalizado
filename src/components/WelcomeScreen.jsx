import { useState } from 'react';
import PropTypes from 'prop-types';

function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('todas');
  const [limit, setLimit] = useState(10);
  const [theme, setTheme] = useState('classic');

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({
      name: name.trim() || 'Anónimo',
      category,
      limit: Number(limit),
      theme
    });
  };

  return (
    <main className="welcome-screen" aria-labelledby="welcome-heading">
      <div className="welcome-icon" aria-hidden="true">🧠</div>

      <h1 id="welcome-heading" className="welcome-title">Quiz de Cultura Geral</h1>

      <p className="welcome-description">
        Angola, África e muito mais — vê até onde vai o teu conhecimento!
      </p>

      <form onSubmit={handleSubmit} className="customizer-form" aria-label="Configurar quiz">
        
        <div className="form-group">
          <label htmlFor="player-name">O teu nome</label>
          <input
            type="text"
            id="player-name"
            placeholder="Como te chamas?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="form-input"
            autoComplete="given-name"
            aria-describedby="player-name-hint"
          />
          <span id="player-name-hint" className="sr-only">Máximo de 20 caracteres. Deixa em branco para jogar como Anónimo.</span>
        </div>

        <div className="form-group">
          <label htmlFor="category-select">Categoria</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option value="todas">Mistura (tudo)</option>
            <option value="Angola 🇦🇴">Angola 🇦🇴</option>
            <option value="África 🌍">África 🌍</option>
            <option value="geral">Cultura Geral 🌐</option>
          </select>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="limit-select">Nº de perguntas</label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="form-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="theme-select">Tema visual</label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="form-select"
            >
              <option value="classic">Neon 💜</option>
              <option value="angola">Angola ❤️</option>
              <option value="nature">Savana 💚</option>
            </select>
          </div>
        </div>

        <button type="submit" id="start-quiz-btn" className="btn-primary start-form-btn" aria-label="Começar o quiz">
          Começar
          <span className="btn-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </main>
  );
}

WelcomeScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default WelcomeScreen;
