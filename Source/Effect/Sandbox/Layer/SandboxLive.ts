/**
 * @module Effect/Sandbox/Layer/SandboxLive
 * @description
 * Live layer for Sandbox service.
 * Provides access to VSCode preload globals from window.vscode.
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @see {@link Effect/Sandbox/Layer/SandboxMock} Mock layer
 * @category Layer
 */

import { Context, Effect, Layer } from "effect";
import { Sandbox } from "../Tag/SandboxTag.js";
import type { SandboxService } from "../Interface/SandboxService.js";
import {
	SandboxNotReadyError,
	ConfigurationNotReadyError,
	type IPCRenderer,
	type ISandboxConfiguration,
	type SandboxContext,
	type SandboxGlobals,
} from "../../../Types/Sandbox.js";

/**
 * Live layer for Sandbox service.
 * Provides access to window.vscode preload globals with polling-based ready check.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SandboxLive } from "./Effect/Sandbox/Layer/SandboxLive.js";
 *
 * const appLayer = SandboxLive;
 * ```
 */
const SandboxLive = Layer.effect(
	Context.GenericTag<SandboxService>("Sandbox"),
	Effect.gen(function* () {
		// Check if preload has run
		const checkReady = Effect.sync((): boolean => {
			const vscode = (window as any).vscode as SandboxGlobals | undefined;
			return !!vscode && typeof vscode === "object";
		});

		// Attempt to get globals
		const getGlobals = Effect.sync(() => {
			const vscode = (window as any).vscode as SandboxGlobals | undefined;
			if (!vscode) throw new SandboxNotReadyError();
			return vscode;
		}).pipe(Effect.mapError(() => new SandboxNotReadyError()));

		// Await ready using polling (reliable across all environments)
		const awaitReady = Effect.gen(function* () {
			let attempts = 0;
			const maxAttempts = 300; // 30 seconds at 100ms intervals

			while (attempts < maxAttempts) {
				// Check if preloadGlobals exists (from Install.ts)
				const preloadGlobals = (window as any).preloadGlobals;
				if (preloadGlobals && preloadGlobals.process && preloadGlobals.ipcRenderer) {
					// Now check for window.vscode
					const vscode = (window as any).vscode;
					if (vscode) {
						console.log("[Sandbox] Preload globals and window.vscode ready");
						return vscode;
					}
				}

				attempts++;
				yield* Effect.sleep("100 millis");
			}

			throw new SandboxNotReadyError();
		}).pipe(
			Effect.timeout("30 seconds"),
			Effect.mapError(() => new SandboxNotReadyError()),
		);

		// Get IPC from globals
		const ipc = Effect.gen(function* () {
			const g = yield* getGlobals;
			if (!g.ipcRenderer) {
				return yield* Effect.fail(new SandboxNotReadyError());
			}
			return g.ipcRenderer as IPCRenderer;
		});

		// Get configuration context
		const configuration = Effect.gen(function* () {
			const g = yield* getGlobals;
			if (!g.context) {
				return yield* Effect.fail(new SandboxNotReadyError());
			}
			return g.context as SandboxContext;
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
					: Effect.fail(error as ConfigurationNotReadyError),
			),
		);

		const service: SandboxService = {
			globals: getGlobals,
			isReady: checkReady,
			awaitReady,
			ipc,
			configuration,
			resolveConfiguration,
		};

		return service;
	}),
);

export default SandboxLive;
