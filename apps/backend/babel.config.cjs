// Configuração Babel exclusiva para o Jest.
// O projecto usa "type": "module" (ESM nativo) para correr em produção,
// mas o Jest, por defeito, trabalha melhor transpilando para CommonJS.
// Este ficheiro só é lido pelo babel-jest durante os testes.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: [
    // jwt.js usa import.meta.url para localizar a pasta de chaves RSA;
    // este plugin torna isso compatível com a transpilação para CommonJS.
    'babel-plugin-transform-import-meta',
  ],
};
