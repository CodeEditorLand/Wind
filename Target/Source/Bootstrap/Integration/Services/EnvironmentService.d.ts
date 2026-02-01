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
    getEnv: (key: string, fallback?: string) => Effect.Effect<string | undefined>;
    /**
     * Check if running in Tauri environment
     */
    isTauri: () => Effect.Effect<boolean>;
    /**
     * Get OS information (platform, arch, version)
     */
    getOS: () => Effect.Effect<OSInfo>;
}
export declare const EnvironmentServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, EnvironmentService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the environment service layer
 * @returns Effect-TS layer for EnvironmentService
 */
export declare function createEnvironmentServiceLayer(): Effect.Layer<never>;
/**
 * Effect wrapper for getting platform
 */
export declare const getPlatformEffect: Effect.Effect<unknown, unknown, unknown>;
/**
 * Effect wrapper for getting language
 */
export declare const getLanguageEffect: Effect.Effect<unknown, unknown, unknown>;
/**
 * Effect wrapper for getting timezone
 */
export declare const getTimezoneEffect: Effect.Effect<unknown, unknown, unknown>;
/**
 * Effect wrapper for getting user agent
 */
export declare const getUserAgentEffect: Effect.Effect<unknown, unknown, unknown>;
/**
 * Effect wrapper for getting environment variable
 */
export declare function getEnvEffect(key: string, fallback?: string): Effect.Effect<string | undefined>;
/**
 * Effect wrapper for checking if Tauri
 */
export declare const isTauriEffect: Effect.Effect<unknown, unknown, unknown>;
/**
 * Effect wrapper for getting OS info
 */
export declare const getOSEffect: Effect.Effect<unknown, unknown, unknown>;
export type { EnvironmentService, OSInfo, Platform };
export default EnvironmentServiceTag;
//# sourceMappingURL=EnvironmentService.d.ts.map