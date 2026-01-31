/**
 * @module Bootstrap/Integration/Services/EnvironmentService
 * @description
 * Environment detection and runtime information service.
 *
 * Features:
 * - Detect platform (Tauri/Browser/Web)
 * - Detect language and timezone
 * - Get user agent information
 * - Load environment variables from Mountain: TauriInvoke('mountain_fetch_env')
 * - OS info and architecture detection
 * - Handle platform-specific paths
 * - Effect-TS wrappers for async operations
 * - Defensive coding with fallbacks
 *
 * VSCode IBrowserWorkbenchEnvironmentService compatibility
 */

import * as Effect from "effect/Effect";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Platform type
 */
export type Platform = "tauri" | "browser" | "web";

/**
 * OS information
 */
export interface OSInfo {
	/** Platform identifier (e.g., 'Win32', 'Darwin', 'Linux x86_64') */
	platform: string;
	/** Architecture (e.g., 'x64', 'arm64', 'x86', 'unknown') */
	arch: string;
	/** OS version (if available) */
	version?: string;
}

/**
 * Environment service interface
 */
export interface EnvironmentService {
	/**
	 * Get current platform:
	 * - 'tauri': Running in Tauri desktop environment
	 * - 'browser': Running in standard web browser
	 * - 'web': Generic web environment (fallback)
	 */
	getPlatform: () => Effect.Effect<Platform>;

	/**
	 * Get browser language code (e.g., 'en-US', 'fr-FR')
	 */
	getLanguage: () => Effect.Effect<string>;

	/**
	 * Get timezone string (e.g., 'America/New_York', 'Europe/London')
	 */
	getTimezone: () => Effect.Effect<string>;

	/**
	 * Get user agent string
	 */
	getUserAgent: () => Effect.Effect<string>;

	/**
	 * Get environment variable with optional fallback
	 * @param key - Environment variable name
	 * @param fallback - Fallback value if not found
	 */
	getEnv: (
		key: string,
		fallback?: string,
	) => Effect.Effect<string | undefined>;

	/**
	 * Check if running in Tauri environment
	 */
	isTauri: () => Effect.Effect<boolean>;

	/**
	 * Get OS information (platform, arch, version)
	 */
	getOS: () => Effect.Effect<OSInfo>;
}

// ============================================================================
// CONTEXT TAG
// ============================================================================

export const EnvironmentServiceTag = Effect.Tag<
	EnvironmentService,
	EnvironmentService
>("EnvironmentService");

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Tauri is available
 */
function isTauriAvailable(): boolean {
	return typeof (globalThis as any).__TAURI__ !== "undefined";
}

/**
 * Detect platform
 */
function detectPlatform(): Platform {
	if (isTauriAvailable()) {
		return "tauri";
	}
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		return "browser";
	}
	return "web";
}

/**
 * Get language from browser
 */
function getBrowserLanguage(): string {
	if (typeof navigator !== "undefined" && navigator.language) {
		return navigator.language;
	}
	return "en-US"; // Fallback
}

/**
 * Validate language code format
 */
function isValidLanguageCode(code: string): boolean {
	return /^[a-z]{2}-[A-Z]{2}$/.test(code);
}

/**
 * Get user agent from navigator
 */
function getUserAgentString(): string {
	if (typeof navigator !== "undefined" && navigator.userAgent) {
		return navigator.userAgent;
	}
	return "Wind/1.0.0 (Unknown)"; // Fallback
}

/**
 * Detect architecture from user agent
 */
function detectArchitecture(): string {
	if (typeof navigator !== "undefined" && navigator.userAgent) {
		const ua = navigator.userAgent;

		if (
			ua.includes("x86_64") ||
			ua.includes("x64") ||
			ua.includes("WOW64")
		) {
			return "x64";
		}
		if (
			ua.includes("arm64") ||
			ua.includes("aarch64") ||
			ua.includes("armv8")
		) {
			return "arm64";
		}
		if (ua.includes("i686") || ua.includes("i386") || ua.includes("x86")) {
			return "x86";
		}
	}
	return "unknown";
}

/**
 * Detect platform from navigator
 */
function detectOSPlatform(): string {
	if (typeof navigator !== "undefined" && navigator.platform) {
		return navigator.platform;
	}
	return "unknown";
}

/**
 * Sanitize path for current platform
 */
function sanitizePath(path: string, platform: Platform): string {
	// No sanitization needed for web platforms
	if (platform === "browser" || platform === "web") {
		return path;
	}

	// Basic path normalization
	return path.replace(/\\/g, "/");
}

/**
 * Get environment variable from multiple sources
 */
async function getEnvironmentVariable(
	key: string,
): Promise<string | undefined> {
	// Try Mountain (Tauri) first
	if (isTauriAvailable()) {
		try {
			const { invoke } = (globalThis as any).__TAURI__.core;
			const envVars = await invoke("mountain_fetch_env");
			if (envVars && typeof envVars === "object" && key in envVars) {
				return envVars[key];
			}
		} catch {
			// Continue to fallbacks
		}
	}

	// Try process.env (Node.js environment)
	if (typeof process !== "undefined" && process.env && key in process.env) {
		return process.env[key];
	}

	return undefined;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

const EnvironmentServiceImpl = EnvironmentServiceTag.of({
	getPlatform: () =>
		Effect.sync(() => {
			return detectPlatform();
		}),

	getLanguage: () =>
		Effect.sync(() => {
			let language = getBrowserLanguage();

			// Validate language code format
			if (!isValidLanguageCode(language)) {
				// Try extracting first two characters
				const shortLang = language.split("-")[0];
				language = `${shortLang}-${shortLang.toUpperCase()}`;

				// Still invalid, use fallback
				if (!isValidLanguageCode(language)) {
					language = "en-US";
				}
			}

			return language;
		}),

	getTimezone: () =>
		Effect.sync(() => {
			try {
				if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
					return Intl.DateTimeFormat().resolvedOptions().timeZone;
				}
			} catch {
				// Ignore timezone detection errors
			}
			return "UTC"; // Fallback
		}),

	getUserAgent: () =>
		Effect.sync(() => {
			return getUserAgentString();
		}),

	getEnv: (key: string, fallback: string | undefined = undefined) =>
		Effect.tryPromise({
			try: async () => {
				const value = await getEnvironmentVariable(key);
				return value ?? fallback;
			},
			catch: () => {
				// Silently fail, return fallback or undefined
				return fallback;
			},
		}),

	isTauri: () =>
		Effect.sync(() => {
			return isTauriAvailable();
		}),

	getOS: () =>
		Effect.sync(() => {
			return {
				platform: detectOSPlatform(),
				arch: detectArchitecture(),
			};
		}),

	/**
	 * Sanitize file path for current platform
	 */
	sanitizePath: (path: string) =>
		Effect.sync(() => {
			return sanitizePath(path, detectPlatform());
		}),

	/**
	 * Join path segments for current platform
	 */
	joinPath: (...segments: string[]) =>
		Effect.sync(() => {
			const platform = detectPlatform();

			if (platform === "tauri") {
				// Use forward slashes internally, will be converted by Tauri
				return segments.join("/").replace(/\/+/g, "/");
			}

			// For web platforms, use URL-style paths
			return segments.join("/").replace(/\/+/g, "/");
		}),

	/**
	 * Get app data directory for current platform
	 */
	getAppDataDir: () =>
		Effect.sync(() => {
			const platform = detectPlatform();

			if (platform === "tauri") {
				// Tauri will provide proper app data directory
				// This is a placeholder - actual implementation would use Tauri APIs
				return "";
			}

			// For web, use empty string (no filesystem access)
			return "";
		}),

	/**
	 * Get home directory for current platform
	 */
	getHomeDir: () =>
		Effect.sync(() => {
			const platform = detectPlatform();

			if (platform === "tauri") {
				// Tauri will provide proper home directory
				// This is a placeholder - actual implementation would use Tauri APIs
				return "";
			}

			// For web, no concept of home directory
			return "";
		}),

	/**
	 * Convert URI to OS path
	 */
	uriToPath: (uri: string) =>
		Effect.sync(() => {
			// Handle tauri:// URIs
			if (uri.startsWith("tauri://")) {
				return uri.substring(8);
			}

			// Handle file:// URIs
			if (uri.startsWith("file://")) {
				return decodeURIComponent(uri.substring(7));
			}

			// Return as-is for relative/absolute paths
			return uri;
		}),

	/**
	 * Convert OS path to URI
	 */
	pathToUri: (path: string) =>
		Effect.sync(() => {
			// If already a URI, return as-is
			if (path.startsWith("file://") || path.startsWith("tauri://")) {
				return path;
			}

			// Convert to file:// URI
			return `file://${encodeURIComponent(path)}`;
		}),
});

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create the environment service layer
 * @returns Effect-TS layer for EnvironmentService
 */
export function createEnvironmentServiceLayer(): Effect.Layer<never> {
	return EnvironmentServiceTag.provide(EnvironmentServiceImpl);
}

// ============================================================================
// EFFECT-TS WRAPPERS
// ============================================================================

/**
 * Effect wrapper for getting platform
 */
export const getPlatformEffect = Effect.flatMap(
	EnvironmentServiceTag,
	(service) => service.getPlatform(),
);

/**
 * Effect wrapper for getting language
 */
export const getLanguageEffect = Effect.flatMap(
	EnvironmentServiceTag,
	(service) => service.getLanguage(),
);

/**
 * Effect wrapper for getting timezone
 */
export const getTimezoneEffect = Effect.flatMap(
	EnvironmentServiceTag,
	(service) => service.getTimezone(),
);

/**
 * Effect wrapper for getting user agent
 */
export const getUserAgentEffect = Effect.flatMap(
	EnvironmentServiceTag,
	(service) => service.getUserAgent(),
);

/**
 * Effect wrapper for getting environment variable
 */
export function getEnvEffect(
	key: string,
	fallback?: string,
): Effect.Effect<string | undefined> {
	return Effect.flatMap(EnvironmentServiceTag, (service) =>
		service.getEnv(key, fallback),
	);
}

/**
 * Effect wrapper for checking if Tauri
 */
export const isTauriEffect = Effect.flatMap(EnvironmentServiceTag, (service) =>
	service.isTauri(),
);

/**
 * Effect wrapper for getting OS info
 */
export const getOSEffect = Effect.flatMap(EnvironmentServiceTag, (service) =>
	service.getOS(),
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { EnvironmentService, OSInfo, Platform };
export default EnvironmentServiceTag;
