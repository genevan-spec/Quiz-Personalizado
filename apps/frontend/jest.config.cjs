module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/test/fileMock.cjs',
  },
  // Garante que import.meta.env.VITE_* tem um valor previsível nos testes
  // (o plugin babel converte import.meta.env.X em process.env.X)
  clearMocks: true,
  verbose: true,
};
