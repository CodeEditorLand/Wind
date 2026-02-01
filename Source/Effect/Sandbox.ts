/**
 * @module Effect/Sandbox
 * @description
 * Sandbox globals service - the preload contract as Effect-TS.
 * Provides access to window.vscode with proper error handling.
 */

import { Context, Effect, Layer } from "effect";

import {
	ConfigurationNotReadyError,
	SandboxNotReadyError,
	type IPCRenderer,
	type ISandboxConfiguration,
	type SandboxContext,
	type SandboxGlobals,
} from "../Types/Sandbox.js";

// ============================================================================
// Sandbox Service Interface
// ============================================================================

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
	readonly resolveConfiguration: Effect.Effect<
		ISandboxConfiguration,
		ConfigurationNotReadyError
	>;
}

export const Sandbox = Context.GenericTag<SandboxService>("Sandbox");

// ============================================================================
// Implementation from window.vscode
// ============================================================================

export const SandboxLive = Layer.effect(
	Sandbox,
	Effect.gen(function* () {
		// Check if preload has run
		const checkReady = Effect.sync(() => {
			const vscode = (window as any).vscode;
			return vscode && typeof vscode === "object";
		});

		// Attempt to get globals
		const getGlobals = Effect.sync(() => {
			const vscode = (window as any).vscode as SandboxGlobals | undefined;
			if (!vscode) throw new SandboxNotReadyError();
			return vscode;
		}).pipe(Effect.mapError(() => new SandboxNotReadyError()));

		// Await ready using browser event (replaces setInterval polling)
		const awaitReady = Effect.async<SandboxGlobals, SandboxNotReadyError>(
			(resume) => {
				const vscode = (window as any).vscode;

				if (vscode) {
					resume(Effect.succeed(vscode));
					return;
				}

				// Listen for preload ready event
				const handler = () => {
					const vscode = (window as any).vscode;
					if (vscode) {
						resume(Effect.succeed(vscode));
					} else {
						resume(Effect.fail(new SandboxNotReadyError()));
					}
				};

				window.addEventListener("vscode-wind-preload-ready", handler, {
					once: true,
				});

				// Timeout after 30 seconds
				setTimeout(() => {
					resume(Effect.fail(new SandboxNotReadyError()));
				}, 30000);

				// Cleanup function
				return Effect.sync(() => {
					window.removeEventListener(
						"vscode-wind-preload-ready",
						handler,
					);
				});
			},
		).pipe(
			Effect.timeout("30 seconds"),
			Effect.mapError(() => new SandboxNotReadyError()),
		);

		// Get IPC from globals
		const ipc = Effect.gen(function* () {
			const g = yield* getGlobals;
			if (!g.ipcRenderer) {
				return yield* Effect.fail(new SandboxNotReadyError());
			}
			return g.ipcRenderer;
		});

		// Get configuration context
		const configuration = Effect.gen(function* () {
			const g = yield* getGlobals;
			if (!g.context) {
				return yield* Effect.fail(new SandboxNotReadyError());
			}
			return g.context;
		});

		// Resolve configuration with proper error handling
		const resolveConfiguration = Effect.gen(function* () {
			const ctx = yield* configuration;
			return yield* Effect.tryPromise({
				try: () => ctx.resolveConfiguration(),
				catch: () => new ConfigurationNotReadyError(),
			});
		}).pipe(
			Effect.catchAll((error) =>
				error instanceof SandboxNotReadyError
					? Effect.fail(new ConfigurationNotReadyError())
					: Effect.fail(error as ConfigurationNotReadyError)
			),
		);

		return {
			globals: getGlobals,
			isReady: checkReady,
			awaitReady,
			ipc,
			configuration,
			resolveConfiguration,
		};
	}),
);

// ============================================================================
// Mock Implementation
// ============================================================================

export const SandboxMockLive = Layer.succeed(Sandbox, {
	globals: Effect.die(new SandboxNotReadyError()),
	isReady: Effect.succeed(false),
	awaitReady: Effect.die(new SandboxNotReadyError()),
	ipc: Effect.die(new SandboxNotReadyError()),
	configuration: Effect.die(new SandboxNotReadyError()),
	resolveConfiguration: Effect.fail(new ConfigurationNotReadyError()),
});
