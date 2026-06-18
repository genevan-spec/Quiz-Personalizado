// Configuração Babel exclusiva para o Jest (o Vite usa esbuild, não isto).
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // Substitui import.meta.env.X por process.env.X, para que o código que
    // usa variáveis de ambiente do Vite (ex: lib/api.js, QuizContext.jsx)
    // funcione sob o Jest, que não conhece import.meta.
    'babel-plugin-transform-vite-meta-env',
  ],
};
