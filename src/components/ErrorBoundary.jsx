import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Erro capturado:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <span className="error-boundary__icon">⚠️</span>
            <h2>Algo correu mal</h2>
            <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
            {import.meta.env.DEV && (
              <pre className="error-boundary__detail">
                {this.state.error?.message}
              </pre>
            )}
            <button
              type="button"
              className="error-boundary__btn"
              onClick={this.handleReset}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
