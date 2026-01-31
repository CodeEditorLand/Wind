/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service using Effect-TS.
 * Consolidates configuration fetching, validation, and reactive updates.
 * Replaces duplicated logic in Preload, MountainIntegrationService, and MountainWindSync.
 */

import { Context, Effect, Layer, Stream, SubscriptionRef, Schedule } from "effect";
import type { ISandboxConfiguration, ProcessEnvironment } from "../Types/Sandbox.js";
import { ConfigurationNotReadyError } from "../Types/Sandbox.js";
import { IPC, IPCService } from "./IPC.js";
import { Sandbox, SandboxService } from "./Sandbox.js";

// ============================================================================
// Configuration Error Types
// ============================================================================

export class ConfigFetchError extends Error {
  readonly _tag = "ConfigFetchError";
  constructor(override readonly cause: unknown) {
    super(`Failed to fetch configuration: ${String(cause)}`);
  }
}

export class ConfigValidationError extends Error {
  readonly _tag = "ConfigValidationError";
  constructor(readonly issues: ReadonlyArray<string>) {
    super(`Configuration validation failed: ${issues.join(', ')}`);
  }
}

export class ConfigApplyError extends Error {
  readonly _tag = "ConfigApplyError";
  constructor(readonly key: string, override readonly cause: unknown) {
    super(`Failed to apply configuration for '${key}': ${String(cause)}`);
  }
}

// ============================================================================
// Configuration Schema Validation
// ============================================================================

interface ConfigSchemaIssue {
  readonly path: string;
  readonly message: string;
}

const validateConfig = (config: unknown): ReadonlyArray<ConfigSchemaIssue> => {
  const issues: ConfigSchemaIssue[] = [];
  
  if (!config || typeof config !== 'object') {
    issues.push({ path: '', message: 'Configuration must be an object' });
    return issues;
  }
  
  const cfg = config as Record<string, unknown>;
  
  // Validate zoomLevel if present
  if (cfg.zoomLevel !== undefined) {
    if (typeof cfg.zoomLevel !== 'number') {
      issues.push({ path: 'zoomLevel', message: 'Must be a number' });
    } else if (cfg.zoomLevel < -10 || cfg.zoomLevel > 10) {
      issues.push({ path: 'zoomLevel', message: 'Must be between -10 and 10' });
    }
  }
  
  // Validate userEnv if present
  if (cfg.userEnv !== undefined && typeof cfg.userEnv !== 'object') {
    issues.push({ path: 'userEnv', message: 'Must be an object' });
  }
  
  // Validate workspace if present
  if (cfg.workspace !== undefined) {
    if (typeof cfg.workspace !== 'object' || cfg.workspace === null) {
      issues.push({ path: 'workspace', message: 'Must be an object' });
    } else {
      const ws = cfg.workspace as Record<string, unknown>;
      if (ws.id !== undefined && typeof ws.id !== 'string') {
        issues.push({ path: 'workspace.id', message: 'Must be a string' });
      }
      if (ws.uri !== undefined && typeof ws.uri !== 'string') {
        issues.push({ path: 'workspace.uri', message: 'Must be a string' });
      }
    }
  }
  
  return issues;
};

// ============================================================================
// Configuration Service Interface
// ============================================================================

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

export const Configuration = Context.GenericTag<ConfigurationService>("Configuration");

// ============================================================================
// Implementation
// ============================================================================

export const ConfigurationLive = Layer.effect(
  Configuration,
  Effect.gen(function* () {
    const sandbox = yield* Sandbox;
    const ipc = yield* IPC;
    
    // Create subscription ref for reactive configuration
    const configRef = yield* SubscriptionRef.make<ISandboxConfiguration | null>(null);
    
    // Atom: Fetch configuration from backend
    const fetch = Effect.gen(function* () {
      // First try to get from sandbox context (already loaded by preload)
      const fromSandbox = yield* sandbox.resolveConfiguration.pipe(
        Effect.either
      );
      
      if (fromSandbox._tag === "Right") {
        return fromSandbox.right;
      }
      
      // Fallback: fetch directly via IPC
      return yield* ipc.invoke("mountain_get_workbench_configuration")([]).pipe(
        Effect.mapError((error) => new ConfigFetchError(error))
      );
    });
    
    // Atom: Validate configuration
    const validate = (config: unknown): Effect.Effect<ISandboxConfiguration, ConfigValidationError> =>
      Effect.sync(() => validateConfig(config)).pipe(
        Effect.flatMap((issues) =>
          issues.length > 0
            ? Effect.fail(new ConfigValidationError(issues.map(i => `${i.path}: ${i.message}`)))
            : Effect.succeed(config as ISandboxConfiguration)
        )
      );
    
    // Atom: Apply configuration (zoom, userEnv)
    const apply = (config: ISandboxConfiguration): Effect.Effect<void, ConfigApplyError> =>
      Effect.gen(function* () {
        // Apply zoom level
        if (config.zoomLevel !== undefined) {
          yield* Effect.sync(() => {
            document.documentElement.style.setProperty('--zoom-level', String(config.zoomLevel));
          }).pipe(
            Effect.mapError((error) => new ConfigApplyError('zoomLevel', error))
          );
        }
        
        // Apply userEnv to process.env
        if (config.userEnv) {
          yield* Effect.forEach(
            Object.entries(config.userEnv),
            ([key, value]) =>
              Effect.sync(() => {
                if (value !== undefined) {
                  process.env[key] = value;
                }
              }).pipe(
                Effect.mapError((error) => new ConfigApplyError(`userEnv.${key}`, error))
              ),
            { discard: true }
          );
        }
        
        // Update the subscription ref
        yield* configRef.set(config);
        
        console.log('[Configuration] Applied configuration:', config);
      });
    
    // Atom: Get current configuration
    const get = Effect.gen(function* () {
      const current = yield* configRef.get;
      if (current === null) {
        return yield* Effect.fail(new ConfigurationNotReadyError());
      }
      return current;
    });
    
    // Atom: Refresh configuration from backend
    const refresh = Effect.gen(function* () {
      const raw = yield* fetch;
      const validated = yield* validate(raw);
      yield* apply(validated);
      return validated;
    });
    
    // Stream of configuration changes
    const changes = Stream.fromSubscriptionRef(configRef).pipe(
      Stream.filter((config): config is ISandboxConfiguration => config !== null)
    );
    
    // Initialize: fetch and apply on startup
    yield* Effect.log('[Configuration] Initializing configuration service');
    
    return {
      get,
      fetch,
      validate,
      apply,
      changes,
      refresh
    };
  })
);

// ============================================================================
// Live with polling for changes
// ============================================================================

export const ConfigurationWithSyncLive = ConfigurationLive.pipe(
  Layer.effect(Configuration, (baseConfig) =>
    Effect.gen(function* () {
      const base = yield* baseConfig;
      const ipc = yield* IPC;
      
      // Set up background sync from Mountain events
      const syncFiber = yield* ipc.events("mountain_configuration_update").pipe(
        Stream.runForEach((message) =>
          Effect.gen(function* () {
            console.log('[Configuration] Received update from Mountain:', message);
            const raw = message.args[0];
            const validated = yield* base.validate(raw);
            yield* base.apply(validated);
          }).pipe(
            Effect.catchAll((error) =>
              Effect.logError(`[Configuration] Failed to apply update: ${error}`)
            )
          )
        ),
        Effect.fork
      );
      
      return {
        ...base,
        refresh: base.refresh.pipe(
          Effect.tap(() => Effect.log('[Configuration] Configuration refreshed'))
        )
      };
    })
  )
);

// ============================================================================
// Mock Implementation
// ============================================================================

export const ConfigurationMockLive = Layer.succeed(
  Configuration,
  {
    get: Effect.succeed({} as ISandboxConfiguration),
    fetch: Effect.succeed({} as ISandboxConfiguration),
    validate: (config) => Effect.succeed(config as ISandboxConfiguration),
    apply: () => Effect.unit,
    changes: Stream.empty,
    refresh: Effect.succeed({} as ISandboxConfiguration)
  }
);
