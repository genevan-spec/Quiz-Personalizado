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
    <div className="welcome-screen">
      <div className="welcome-icon">🧠</div>

      <h1 className="welcome-title">Quiz de Cultura Geral</h1>

      <p className="welcome-description">
        Angola, África e muito mais — vê até onde vai o teu conhecimento!
      </p>

      <form onSubmit={handleSubmit} className="customizer-form">
        
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
          />
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
            <label htmlFor="theme-select">Tema</label>
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

        <button type="submit" id="start-quiz-btn" className="btn-primary start-form-btn">
          Começar
          <span className="btn-arrow">→</span>
        </button>
      </form>
    </div>
  );
}

WelcomeScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default WelcomeScreen;
