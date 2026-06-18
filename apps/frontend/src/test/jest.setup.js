import '@testing-library/jest-dom';

// Equivalente às variáveis de ambiente do Vite (import.meta.env.VITE_*),
// já convertidas para process.env.* pelo babel-plugin-transform-vite-meta-env.
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL ?? '/api';
process.env.VITE_MAX_QUESTIONS = process.env.VITE_MAX_QUESTIONS ?? '20';
