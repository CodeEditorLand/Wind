/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/Source'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@tauri-apps/api/core$': '<rootDir>/Source/Mocks/tauri.mock.ts'
  },

  collectCoverageFrom: [
    'Source/**/*.ts',
    '!Source/**/*.d.ts',
    '!Source/**/*.test.ts',
    '!Source/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};

export default config;
