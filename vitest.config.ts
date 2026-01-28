/**
 * Vitest configuration for Wind test suite
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['Test/**/*.test.ts'],
		exclude: ['node_modules', 'Target', 'Documentation'],
		environment: 'jsdom', // Use jsdom for DOM testing
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['Source/**/*.ts'],
			exclude: [
				'Source/Archive/**',
				'Test/**',
				'node_modules/**',
				'Target/**',
				'*.d.ts',
				'*.config.ts',
			],
			lines: 80,
			functions: 80,
			branches: 80,
			statements: 80,
		},
	},
	resolve: {
		alias: {
			'@codeeditorland/wind': path.resolve(__dirname, 'Source'),
		},
	},
});
