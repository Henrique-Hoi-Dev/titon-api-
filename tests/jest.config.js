import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import rootConfig from '../jest.config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

export default {
    ...rootConfig,
    rootDir: root,
    displayName: 'functional-tests',
    automock: false,
    bail: true,
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['app/**'],
    coverageDirectory: 'tests/coverage',
    coverageReporters: ['text', 'lcovonly'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/jest_setup.js'],
    testMatch: ['**/tests/integration/*.spec.js?(x)'],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    verbose: true
};
