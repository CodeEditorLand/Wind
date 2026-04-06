/**
 * @module Effect/Sandbox/Layer/SandboxMock
 * @description
 * Mock layer for Sandbox service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live layer
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @category Layer
 */

import { Effect, Layer } from "effect";

import {
	ConfigurationNotReadyError,
	SandboxNotReadyError,
} from "../../../Types/Sandbox.js";
import type { SandboxService } from "../Interface/SandboxService.js";
import { Sandbox } from "../Tag/SandboxTag.js";

/**
 * Mock layer for Sandbox service.
 * Provides a failing implementation for testing non-vscode environments.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SandboxMockLive } from "./Effect/Sandbox/Layer/SandboxMock.js";
 *
 * const testLayer = SandboxMockLive;
 * ```
 */
const SandboxMockLive = Layer.succeed(Sandbox, {
	globals: Effect.die(new SandboxNotReadyError()),
	isReady: Effect.succeed(false),
	awaitReady: Effect.die(new SandboxNotReadyError()),
	ipc: Effect.die(new SandboxNotReadyError()),
	configuration: Effect.die(new SandboxNotReadyError()),
	resolveConfiguration: Effect.fail(new ConfigurationNotReadyError()),
});

export default SandboxMockLive;
