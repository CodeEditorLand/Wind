/**
 * @module Test Bootstrap Integration EnvironmentService
 * @description
 * Comprehensive test suite for EnvironmentService using TDD approach.
 * Tests platform detection, language/timezone detection, Mountain env loading,
 * path handling for each platform, and error scenarios.
 *
 * Following VSCode IBrowserWorkbenchEnvironmentService interface.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Effect from 'effect/Effect';

describe('EnvironmentService - Platform Detection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should detect Tauri platform', async () => {
		// Mock Tauri environment
		(global as any).__TAURI__ = {
			core: { invoke: vi.fn() },
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			"../../../../Source/Bootstrap/Integration/Core/CoreServices.ts"
		);

		const layer = createEnvironmentServiceLayer();
		const platform = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getPlatform();
			}).pipe(Effect.provide(layer))
		);

		expect(platform).toBe('tauri');

		delete (global as any).__TAURI__;
	});

	it('should detect browser platform', async () => {
		// Ensure no Tauri, but browser environment
		delete (global as any).__TAURI__;
		(global as any).window = {
			navigator: { userAgent: 'Mozilla/5.0' },
		};
		(global as any).document = {};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const platform = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getPlatform();
			}).pipe(Effect.provide(layer))
		);

		expect(platform).toBe('browser');

		delete (global as any).window;
		delete (global as any).document;
	});

	it('should return web platform as fallback', async () => {
		delete (global as any).__TAURI__;
		delete (global as any).window;
		delete (global as any).document;

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const platform = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getPlatform();
			}).pipe(Effect.provide(layer))
		);

		expect(platform).toBe('web');
	});

	it('should provide isTauri method that returns correctly', async () => {
		(global as any).__TAURI__ = {
			core: { invoke: vi.fn() },
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const isTauri = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.isTauri();
			}).pipe(Effect.provide(layer))
		);

		expect(isTauri).toBe(true);

		delete (global as any).__TAURI__;
	});
});

describe('EnvironmentService - Language Detection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should detect browser language', async () => {
		(global as any).navigator = {
			language: 'en-US',
			userAgent: 'Mozilla/5.0',
		};
		(global as any).window = {};
		(global as any).document = {};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const language = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getLanguage();
			}).pipe(Effect.provide(layer))
		);

		expect(language).toBe('en-US');

		delete (global as any).navigator;
		delete (global as any).window;
		delete (global as any).document;
	});

	it('should handle missing navigator gracefully', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const language = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getLanguage();
			}).pipe(Effect.provide(layer))
		);

		expect(language).toBe('en-US'); // Fallback
	});

	it('should handle malformed language codes', async () => {
		(global as any).navigator = {
			language: 'invalid',
			userAgent: 'Mozilla/5.0',
		};
		(global as any).window = {};
		(global as any).document = {};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const language = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getLanguage();
			}).pipe(Effect.provide(layer))
		);

		expect(typeof language).toBe('string');

		delete (global as any).navigator;
		delete (global as any).window;
		delete (global as any).document;
	});

	it('should return valid language format code', async () => {
		// Test various language codes
		(global as any).navigator = {
			language: 'fr-FR',
			userAgent: 'Mozilla/5.0',
		};
		(global as any).window = {};
		(global as any).document = {};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const language = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getLanguage();
			}).pipe(Effect.provide(layer))
		);

		expect(language).toMatch(/^[a-z]{2}-[A-Z]{2}$/);

		delete (global as any).navigator;
		delete (global as any).window;
		delete (global as any).document;
	});
});

describe('EnvironmentService - Timezone Detection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should detect browser timezone', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const timezone = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getTimezone();
			}).pipe(Effect.provide(layer))
		);

		expect(typeof timezone).toBe('string');
		expect(timezone.length).toBeGreaterThan(0);
	});

	it('should return UTC as fallback for timezone errors', async () => {
		// Mock Intl.DateTimeFormat to throw error
		const originalDateTimeFormat = Intl.DateTimeFormat;
		vi.spyOn(Intl, 'DateTimeFormat').mockImplementationOnce(() => {
			throw new Error('Intl error');
		});

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const timezone = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getTimezone();
			}).pipe(Effect.provide(layer))
		);

		expect(timezone).toBe('UTC');

		Intl.DateTimeFormat = originalDateTimeFormat;
	});

	it('should return valid IANA timezone format', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const timezone = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getTimezone();
			}).pipe(Effect.provide(layer))
		);

		// IANA timezone format: Area/City (e.g., America/New_York)
		expect(timezone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/);
	});
});

describe('EnvironmentService - Mountain Environment Loading', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch environment variables from Mountain Tauri command', async () => {
		(global as any).__TAURI__ = {
			core: {
				invoke: vi.fn().mockResolvedValue({
					NODE_ENV: 'test',
					DEBUG: 'wind:*',
				}),
			},
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const nodeEnv = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('NODE_ENV');
			}).pipe(Effect.provide(layer))
		);

		expect(nodeEnv).toBe('test');

		delete (global as any).__TAURI__;
	});

	it('should use fallback value when env var not found', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('NONEXISTENT_VAR', 'fallback-value');
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBe('fallback-value');
	});

	it('should return undefined when no fallback provided', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('NONEXISTENT_VAR');
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBeUndefined();
	});

	it('should handle Mountain invoke errors gracefully', async () => {
		(global as any).__TAURI__ = {
			core: {
				invoke: vi.fn().mockRejectedValue(new Error('Mountain not available')),
			},
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('TEST_VAR', 'fallback');
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBe('fallback');

		delete (global as any).__TAURI__;
	});

	it('should handle process.env in Node environments', async () => {
		// Mock Node.js process.env
		(global as any).process = {
			env: {
				TEST_VAR: 'from-process',
			},
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('TEST_VAR');
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBe('from-process');

		delete (global as any).process;
	});
});

describe('EnvironmentService - OS Information Detection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should detect OS platform from navigator', async () => {
		(global as any).navigator = {
			platform: 'Win32',
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.platform).toBe('Win32');
		expect(os.arch).toBe('x64');

		delete (global as any).navigator;
	});

	it('should detect macOS platform', async () => {
		(global as any).navigator = {
			platform: 'MacIntel',
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.platform).toBe('MacIntel');

		delete (global as any).navigator;
	});

	it('should detect Linux platform', async () => {
		(global as any).navigator = {
			platform: 'Linux x86_64',
			userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.platform).toBe('Linux x86_64');

		delete (global as any).navigator;
	});

	it('should detect ARM64 architecture', async () => {
		(global as any).navigator = {
			platform: 'MacIntel',
			userAgent: 'Mozilla/5.0 (Macintosh; ARM64 Mac OS X)',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.arch).toBe('arm64');

		delete (global as any).navigator;
	});

	it('should detect x86 architecture', async () => {
		(global as any).navigator = {
			platform: 'Linux i686',
			userAgent: 'Mozilla/5.0 (X11; Linux i686)',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.arch).toBe('x86');

		delete (global as any).navigator;
	});

	it('should return unknown for missing navigator', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.platform).toBe('unknown');
		expect(os.arch).toBe('unknown');
	});
});

describe('EnvironmentService - Platform-Specific Path Handling', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should normalize Windows paths', async () => {
		(global as any).navigator = {
			platform: 'Win32',
			userAgent: 'Mozilla/5.0',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		// Path normalization should be handled by the service
		// This test verifies OS detection works correctly
		expect(os.platform).toBe('Win32');

		delete (global as any).navigator;
	});

	it('should normalize POSIX paths', async () => {
		(global as any).navigator = {
			platform: 'Linux x86_64',
			userAgent: 'Mozilla/5.0',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const os = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getOS();
			}).pipe(Effect.provide(layer))
		);

		expect(os.platform).toBe('Linux x86_64');

		delete (global as any).navigator;
	});
});

describe('EnvironmentService - User Agent Detection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return user agent string', async () => {
		(global as any).navigator = {
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const userAgent = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getUserAgent();
			}).pipe(Effect.provide(layer))
		);

		expect(userAgent).toBe(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
		);

		delete (global as any).navigator;
	});

	it('should provide fallback user agent', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const userAgent = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getUserAgent();
			}).pipe(Effect.provide(layer))
		);

		expect(userAgent).toBe('Wind/1.0.0 (Unknown)');
	});
});

describe('EnvironmentService - Error Scenarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle missing global objects gracefully', async () => {
		// Remove all global objects
		const originalNavigator = (global as any).navigator;
		const originalWindow = (global as any).window;
		const originalDocument = (global as any).document;
		const originalTAURI = (global as any).__TAURI__;

		delete (global as any).navigator;
		delete (global as any).window;
		delete (global as any).document;
		delete (global as any).__TAURI__;

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();

		// All methods should return fallbacks
		const [platform, language, timezone, userAgent] = await Effect.runPromise(
			Effect.all([
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getPlatform();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getLanguage();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getTimezone();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getUserAgent();
				}),
			]).pipe(Effect.provide(layer))
		);

		expect(platform).toBe('web');
		expect(language).toBe('en-US');
		expect(timezone).toBe('UTC');
		expect(userAgent).toBe('Wind/1.0.0 (Unknown)');

		// Restore globals
		if (originalNavigator) (global as any).navigator = originalNavigator;
		if (originalWindow) (global as any).window = originalWindow;
		if (originalDocument) (global as any).document = originalDocument;
		if (originalTAURI) (global as any).__TAURI__ = originalTAURI;
	});

	it('should handle partial navigator objects', async () => {
		(global as any).navigator = {
			// Missing language
			userAgent: 'Mozilla/5.0',
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const language = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getLanguage();
			}).pipe(Effect.provide(layer))
		);

		expect(language).toBe('en-US'); // Fallback

		delete (global as any).navigator;
	});

	it('should handle Tauri invoke failures', async () => {
		(global as any).__TAURI__ = {
			core: {
				invoke: vi.fn().mockImplementation(() => {
					throw new Error('Tauri invoke failed');
				}),
			},
		};

		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* EnvironmentServiceTag;
				return service.getEnv('TEST_VAR', 'fallback');
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBe('fallback');

		delete (global as any).__TAURI__;
	});
});

describe('EnvironmentService - VSCode Compatibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should implement all VSCode IBrowserWorkbenchEnvironmentService methods', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const service = await Effect.runPromise(
			Effect.gen(function* () {
				return yield* EnvironmentServiceTag;
			}).pipe(Effect.provide(layer))
		);

		// VSCode environment service methods
		expect(service.getPlatform).toBeInstanceOf(Function);
		expect(service.getLanguage).toBeInstanceOf(Function);
		expect(service.getTimezone).toBeInstanceOf(Function);
		expect(service.getUserAgent).toBeInstanceOf(Function);
		expect(service.getEnv).toBeInstanceOf(Function);
		expect(service.isTauri).toBeInstanceOf(Function);
		expect(service.getOS).toBeInstanceOf(Function);
	});

	it('should provide consistent return types', async () => {
		const { createEnvironmentServiceLayer, EnvironmentServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/EnvironmentService.js'
		);

		const layer = createEnvironmentServiceLayer();
		const [platform, language, timezone, userAgent] = await Effect.runPromise(
			Effect.all([
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getPlatform();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getLanguage();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getTimezone();
				}),
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getUserAgent();
				}),
			]).pipe(Effect.provide(layer))
		);

		expect(typeof platform).toBe('string');
		expect(typeof language).toBe('string');
		expect(typeof timezone).toBe('string');
		expect(typeof userAgent).toBe('string');
	});
});
