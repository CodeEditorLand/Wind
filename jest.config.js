/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/Source'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'



















module.exports = config;};  coverageReporters: ['text', 'lcov', 'html']  coverageDirectory: 'coverage',  ],    '!Source/**/__tests__/**'    '!Source/**/*.test.ts',    '!Source/**/*.d.ts',    'Source/**/*.ts',  collectCoverageFrom: [  setupFilesAfterEnv: ['<rootDir>/Source/TestSetup.ts'],  },    '^@tauri-apps/api/core$': '<rootDir>/Source/Mocks/tauri.mock.ts'  moduleNameMapping: {  },    '^.+\.ts$': 'ts-jest',  transform: {  ],
