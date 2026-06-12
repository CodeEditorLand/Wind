/**
 * @module Effect/IPC/Mock
 * @description
 * Mock layer for the IPC service for testing purposes.
 * Provides in-memory IPC state without actual communication.
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { IPCService } from "./Interface/IPCService.js";
import { IPCTag } from "./Tag/IPCTag.js";

/**
 * Mock IPC service for testing
 */
export const MockIPCLive = Layer.succeed(IPCTag, {
	send: (_channel: string) => (_args: ReadonlyArray<unknown>) => Effect.void,
	invoke: (_channel: string) => (_args: ReadonlyArray<unknown>) =>
		Effect.succeed({}),
	events: (_channel: string) => Stream.empty,
	once: (_channel: string) => Effect.succeed({ channel: _channel, args: [] }),
	removeAllListeners: (_channel: string) => Effect.void,
} satisfies IPCService);

export default MockIPCLive;
