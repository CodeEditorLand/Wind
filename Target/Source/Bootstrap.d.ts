/**
 * @module Bootstrap
 * @description
 * Main entry point for Wind's atomic bootstrap system using Effect-TS.
 * Replaces polling-based initialization with reactive Effect streams.
 *
 * Migration from legacy:
 * - Replaces WaitForPreloadAndInitialize() polling with Sandbox.awaitReady
 * - Replaces manual bootstrap orchestration with Effect runtime
 * - Replaces stage callbacks with composable Effect pipes
 * - Replaces manual error handling with typed Effect errors
 *
 * @deprecated Legacy bootstrap. Use Bootstrap/Effect.ts for new code.
 */
/**
 * Legacy bootstrap export for backwards compatibility.
 * @deprecated Use Effect-TS bootstrap instead.
 */
export declare const bootstrap: (options: any) => Promise<any>;
//# sourceMappingURL=Bootstrap.d.ts.map