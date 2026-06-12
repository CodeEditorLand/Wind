/**
 * @module Effect/IPC/Mock
 * @description
 * Mock IPC service for testing purposes.
 * Provides in-memory IPC state without actual communication.
 * @category Implementation
 */

import type { IPCService } from "./Interface/IPCService.js";

/**
 * Mock IPC service for testing
 */
export const MockIPCLive: IPCService = {
	send: (_channel: string, _args: ReadonlyArray<unknown>) => {},

	invoke: async (_channel: string, _args: ReadonlyArray<unknown>) => ({}),

	events: (_channel: string) => ({
		subscribe: (_listener) => () => {},
	}),

	once: async (_channel: string, _callback) => {},

	removeAllListeners: (_channel: string) => {},
};

export default MockIPCLive;
