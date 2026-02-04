/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service using Effect-TS.
 * Consolidates configuration fetching, validation, and reactive updates.
 * Replaces duplicated logic in Preload, MountainIntegrationService, and MountainWindSync.
 */
import { Context, Effect, Layer, Stream } from "effect";
import { ConfigurationNotReadyError, type ISandboxConfiguration } from "../Types/Sandbox.js";
import { MountainTag } from "./Mountain.js";
export declare class ConfigFetchError extends Error {
    readonly cause: unknown;
    readonly _tag = "ConfigFetchError";
    constructor(cause: unknown);
}
export declare class ConfigValidationError extends Error {
    readonly issues: ReadonlyArray<string>;
    readonly _tag = "ConfigValidationError";
    constructor(issues: ReadonlyArray<string>);
}
export declare class ConfigApplyError extends Error {
    readonly key: string;
    readonly cause: unknown;
    readonly _tag = "ConfigApplyError";
    constructor(key: string, cause: unknown);
}
export interface ConfigurationService {
    /** Get current configuration snapshot */
    readonly get: Effect.Effect<ISandboxConfiguration, ConfigurationNotReadyError>;
    /** Fetch configuration from backend */
    readonly fetch: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
    /** Validate configuration structure */
    readonly validate: (config: unknown) => Effect.Effect<ISandboxConfiguration, ConfigValidationError>;
    /** Apply configuration (zoom, userEnv, etc.) */
    readonly apply: (config: ISandboxConfiguration) => Effect.Effect<void, ConfigApplyError>;
    /** Stream of configuration changes */
    readonly changes: Stream.Stream<ISandboxConfiguration, never>;
    /** Force refresh configuration from backend */
    readonly refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
}
declare const ConfigurationTag_base: Context.TagClass<ConfigurationTag, "Configuration", ConfigurationService>;
export declare class ConfigurationTag extends ConfigurationTag_base {
}
export declare const Configuration: typeof ConfigurationTag;
export declare const ConfigurationLive: Layer.Layer<ConfigurationTag, ConfigFetchError, import("./Sandbox.js").SandboxService | import("./IPC.js").IPCTag>;
export declare const ConfigurationWithSyncLive: Layer.Layer<ConfigurationTag, ConfigFetchError, import("./Sandbox.js").SandboxService | import("./IPC.js").IPCTag | MountainTag>;
export declare const getConfigValue: <T>(config: ISandboxConfiguration, path: string) => T | undefined;
export declare const makeMockConfiguration: (overrides?: Partial<ISandboxConfiguration>) => ConfigurationService;
export declare const ConfigurationMock: Layer.Layer<ConfigurationTag, never, never>;
export {};
//# sourceMappingURL=Configuration.d.ts.map