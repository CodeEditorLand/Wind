/**
 * @module Test Bootstrap Integration LoggerService
 * @description
 * Comprehensive test suite for LoggerService using TDD approach.
 * Tests all 6 log levels, Effect-TS wrappers, console integration,
 * file logging, StatusReporter integration, and error scenarios.
 *
 * Following VSCode ILoggerService interface with 6 levels:
 * - trace, debug, info, warning, error, critical
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Effect from 'effect/Effect';

// Mock Tauri API
vi.mock('@tauri-apps/plugin-fs', () => ({
	writeTextFile: vi.fn(),
}));

// Mock StatusReporter - simplified mock since StatusReporter is a Mountain component
const mockStatusReporter = {
	update: vi.fn(),
};

// Mock window object for browser environment
(global as any).window = {
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

describe('LoggerService - Log Levels', () => {
	let loggerService: any;
	let consoleTraceSpy: any;
	let consoleDebugSpy: any;
	let consoleInfoSpy: any;
	let consoleWarnSpy: any;
	let consoleErrorSpy: any;

	beforeEach(() => {
		// Reset module cache and import fresh
		vi.clearAllMocks();
		consoleTraceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {});
		consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
		consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleTraceSpy.mockRestore();
		consoleDebugSpy.mockRestore();
		consoleInfoSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	describe('trace level (0)', () => {
		it('should output trace messages when level is trace', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Core/CoreServices.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'trace' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.trace('Test trace message');
			expect(consoleTraceSpy).toHaveBeenCalledWith(
				expect.stringContaining('TRACE'),
				expect.stringContaining('Test trace message')
			);
		});

		it('should not output trace messages when level is above trace', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'info' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.trace('Should not appear');
			expect(consoleTraceSpy).not.toHaveBeenCalled();
		});

		it('should include data object in trace output', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'trace' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			const data = { key: 'value', number: 123 };
			logger.trace('Test with data', data);
			expect(consoleTraceSpy).toHaveBeenCalled();
		});
	});

	describe('debug level (1)', () => {
		it('should output debug messages when level is debug or lower', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'debug' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.debug('Test debug message');
			expect(consoleDebugSpy).toHaveBeenCalledWith(
				expect.stringContaining('DEBUG'),
				expect.stringContaining('Test debug message')
			);
		});

		it('should not output debug messages when level is above debug', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'info' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.debug('Should not appear');
			expect(consoleDebugSpy).not.toHaveBeenCalled();
		});
	});

	describe('info level (2)', () => {
		it('should output info messages when level is info or lower', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'info' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.info('Test info message');
			expect(consoleInfoSpy).toHaveBeenCalledWith(
				expect.stringContaining('INFO'),
				expect.stringContaining('Test info message')
			);
		});

		it('should include structured data in info output', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'info' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.info('Info with data', { user: 'test', action: 'login' });
			expect(consoleInfoSpy).toHaveBeenCalled();
		});
	});

	describe('warning level (3)', () => {
		it('should output warning messages when level is warning or lower', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'warning' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.warning('Test warning message');
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('WARN'),
				expect.stringContaining('Test warning message')
			);
		});

		it('should include metadata in warning output', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'warning' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.warning('Warning with context', { code: 'W001', suggestion: 'Check config' });
			expect(consoleWarnSpy).toHaveBeenCalled();
		});
	});

	describe('error level (4)', () => {
		it('should output error messages when level is error or lower', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'error' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			const testError = new Error('Test error');
			logger.error('Error occurred', testError);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('ERROR'),
				expect.stringContaining('Error occurred'),
				expect.objectContaining({
					name: 'Error',
					message: 'Test error',
				})
			);
		});

		it('should handle non-Error objects gracefully', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'error' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			logger.error('Error with string', 'String error object');
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it('should handle missing error parameter', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'error' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			expect(() => logger.error('Error message')).not.toThrow();
			expect(consoleErrorSpy).toHaveBeenCalled();
		});
	});

	describe('critical level (5)', () => {
		it('should output critical messages', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'critical' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			const testError = new Error('Critical failure');
			logger.critical('System failure', testError);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('CRITICAL'),
				expect.stringContaining('System failure'),
				expect.objectContaining({
					name: 'Error',
					message: 'Critical failure',
				})
			);
		});

		it('should include full error stack trace', async () => {
			const { createLoggerServiceLayer, LoggerServiceTag } = await import(
				'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
			);

			const layer = createLoggerServiceLayer({ level: 'critical' });
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			const testError = new Error('Stack trace test');
			logger.critical('Critical with stack', testError);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.anything(),
				expect.objectContaining({
					stack: expect.any(String),
				})
			);
		});
	});
});

describe('LoggerService - Effect-TS Wrappers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should provide logEffect wrapper for async logging', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag, logEffect } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

		await Effect.runPromise(
			logEffect('info', 'Test async message').pipe(Effect.provide(layer))
		);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('INFO'),
			expect.stringContaining('Test async message')
		);

		consoleSpy.mockRestore();
	});

	it('should provide errorEffect wrapper for error logging', async () => {
		const { createLoggerServiceLayer, errorEffect } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'error' });
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const testError = new Error('Async error');
		await Effect.runPromise(
			errorEffect('Async error occurred', testError).pipe(Effect.provide(layer))
		);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('ERROR'),
			expect.stringContaining('Async error occurred')
		);

		consoleSpy.mockRestore();
	});

	it('should support Effect composition', async () => {
		const { createLoggerServiceLayer, logEffect } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

		const program = Effect.gen(function* () {
			yield* logEffect('info', 'Step 1');
			yield* logEffect('info', 'Step 2');
			yield* logEffect('info', 'Step 3');
			return 'complete';
		});

		const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

		expect(result).toBe('complete');
		expect(consoleSpy).toHaveBeenCalledTimes(3);

		consoleSpy.mockRestore();
	});
});

describe('LoggerService - Console Integration and Color Coding', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should use correct console method for each level', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			"../../../../Source/Bootstrap/Integration/Core/CoreServices.ts"
		);

		const layer = createLoggerServiceLayer({ level: 'trace' });
		const spyTrace = vi.spyOn(console, 'trace').mockImplementation(() => {});
		const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});
		const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
		const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		logger.trace('trace');
		logger.debug('debug');
		logger.info('info');
		logger.warning('warning');
		logger.error('error');
		logger.critical('critical');

		expect(spyTrace).toHaveBeenCalledTimes(1);
		expect(spyDebug).toHaveBeenCalledTimes(1);
		expect(spyInfo).toHaveBeenCalledTimes(1);
		expect(spyWarn).toHaveBeenCalledTimes(1);
		expect(spyError).toHaveBeenCalledTimes(2); // error + critical

		spyTrace.mockRestore();
		spyDebug.mockRestore();
		spyInfo.mockRestore();
		spyWarn.mockRestore();
		spyError.mockRestore();
	});

	it('should include timestamp in log output', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		logger.info('Test message');

		const callArgs = consoleSpy.mock.calls[0][0];
		expect(callArgs).toMatch(/^\[\d{4}-\d{2}-\d{2}T/); // ISO 8601 format

		consoleSpy.mockRestore();
	});
});

describe('LoggerService - File-based Logging (Tauri Integration)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with log file path when Tauri is available', async () => {
		// Mock __TAURI__
		(global as any).__TAURI__ = {
			core: { invoke: vi.fn() },
		};

		const { createLoggerServiceLayer } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		expect(() => createLoggerServiceLayer({ enableFileLogging: true })).not.toThrow();

		delete (global as any).__TAURI__;
	});

	it('should handle Tauri unavailability gracefully', async () => {
		const { createLoggerServiceLayer } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		expect(() => createLoggerServiceLayer({ enableFileLogging: true })).not.toThrow();
	});

	it('should provide flush Effect for persisting logs', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		expect(() => logger.flush()).not.toThrow();
	});
});

describe('LoggerService - StatusReporter Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should integrate with StatusReporter for error logging', async () => {
		const { StatusReporter } = await import(
			'../../../../Source/Bootstrap/StatusReporter.js'
		);

		const mockUpdate = vi.fn();
		vi.mocked(StatusReporter.getInstance).mockReturnValue({
			update: mockUpdate,
		} as any);

		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({
			level: 'error',
			integrateWithStatusReporter: true,
		});
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		logger.error('Test error for StatusReporter');

		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});
});

describe('LoggerService - Level Management', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should set log level dynamically', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'warning' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		logger.setLevel('trace');
		expect(logger.getLevel()).toBe('trace');
	});

	it('should get current log level', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'debug' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		expect(logger.getLevel()).toBe('debug');

		logger.setLevel('error');
		expect(logger.getLevel()).toBe('error');
	});

	it('should default to info level', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer();
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		expect(logger.getLevel()).toBe('info');
	});
});

describe('LoggerService - Error Handling and Defensive Coding', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle undefined/null data parameters gracefully', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		expect(() => logger.info('Test', undefined as any)).not.toThrow();
		expect(() => logger.info('Test', null as any)).not.toThrow();
	});

	it('should handle circular reference detection', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		const circular: any = { a: 1 };
		circular.self = circular;

		expect(() => logger.info('Circular reference', circular)).not.toThrow();
	});

	it('should handle very long messages', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		const longMessage = 'x'.repeat(10000);
		expect(() => logger.info(longMessage)).not.toThrow();
	});

	it('should handle special characters in messages', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'info' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		expect(() => logger.info('Test with \n newline and \t tabs')).not.toThrow();
		expect(() => logger.info('Test with emojis 🚀✨💯')).not.toThrow();
		expect(() => logger.info('Test with UTF-8 你好世界')).not.toThrow();
	});
});

describe('LoggerService - VSCode Compatibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should implement all VSCode ILoggerService methods', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'trace' });
		const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		// VSCode ILoggerService requires these methods
		expect(logger.trace).toBeInstanceOf(Function);
		expect(logger.debug).toBeInstanceOf(Function);
		expect(logger.info).toBeInstanceOf(Function);
		expect(logger.warn).toBeInstanceOf(Function);
		expect(logger.warning).toBeInstanceOf(Function);
		expect(logger.error).toBeInstanceOf(Function);
		expect(logger.critical).toBeInstanceOf(Function);
		expect(logger.flush).toBeInstanceOf(Function);
		expect(logger.dispose).toBeInstanceOf(Function);
		expect(logger.setLevel).toBeInstanceOf(Function);
		expect(logger.getLevel).toBeInstanceOf(Function);
	});

	it('should support both warn and warning methods (VSCode compatibility)', async () => {
		const { createLoggerServiceLayer, LoggerServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/LoggerService.ts'
		);

		const layer = createLoggerServiceLayer({ level: 'warning' });
	 const logger = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* LoggerServiceTag;
				return service;
			}).pipe(Effect.provide(layer))
		);

		const spyWarn = vi.spyOn(logger, 'warning').mockImplementation(() => {});

		logger.warn('Warning message');
		expect(spyWarn).toHaveBeenCalledWith('Warning message');

		spyWarn.mockRestore();
	});
});
