module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/__tests__/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/routes/**',
    'src/plugins/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/server.js'],
  clearMocks: true,
  verbose: true,
};
