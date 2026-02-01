/**
 * @module Effect/Sandbox
 * @description
 * Sandbox globals service - the preload contract as Effect-TS.
 * Provides access to window.vscode with proper error handling.
 */
import { Context, Effect, Layer } from "effect";
import { ConfigurationNotReadyError, SandboxNotReadyError, type IPCRenderer, type ISandboxConfiguration, type SandboxContext, type SandboxGlobals } from "../Types/Sandbox.js";
export interface SandboxService {
    /** Access the complete sandbox globals */
    readonly globals: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
    /** Safe check if sandbox is ready */
    readonly isReady: Effect.Effect<boolean, never>;
    /** Wait for sandbox to be ready (replaces polling) */
    readonly awaitReady: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
    /** Get IPC renderer (convenience) */
    readonly ipc: Effect.Effect<IPCRenderer, SandboxNotReadyError>;
    /** Get configuration context */
    readonly configuration: Effect.Effect<SandboxContext, SandboxNotReadyError>;
    /** Resolve configuration with Effect */
    readonly resolveConfiguration: Effect.Effect<ISandboxConfiguration, ConfigurationNotReadyError>;
}
export declare const Sandbox: Context.Tag<SandboxService, SandboxService>;
export declare const SandboxLive: Layer.Layer<SandboxService, never, never>;
export declare const SandboxMockLive: Layer.Layer<SandboxService, never, never>;
//# sourceMappingURL=Sandbox.d.ts.map