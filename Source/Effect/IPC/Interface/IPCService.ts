/**
 * @module Effect/IPC/Interface/IPCService
 * @description
 * Service interface for IPC (Inter-Process Communication) operations.
 * Provides methods for sending messages, invoking methods, and subscribing to events.
 * All methods are plain sync/async; errors surface as thrown IPC errors.
 * @see {@link Effect/IPC/Implementation/TauriIPC} Implementation
 * @category Interface
 */

import type {
	IPCInvokeError,
	IPCSendError,
	IPCSubscriptionError,
} from "../Error/IPCError.js";

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * Event emitted on an IPC channel
 */
export interface IPCEvent {
	readonly channel: string;

	readonly args: ReadonlyArray<unknown>;
}

/**
 * Callback for channel events — called once per event
 */
export type IPCEventListener = (event: IPCEvent) => void;

/**
 * Cleanup function for event listeners
 */
export type IPCCleanup = () => void;

/**
 * Async iterator-like stream of events
 */
export interface IPCEventStream {
	/** Subscribe to events; returns cleanup function */
	readonly subscribe: (listener: IPCEventListener) => IPCCleanup;
}

// ============================================================================
// Service Interface
// ============================================================================

/**
 * IPC Service interface — plain functions, no Effect wrappers
 */
export interface IPCService {
	/** Send a message without expecting a response */
	readonly send: (channel: string, args: ReadonlyArray<unknown>) => void;

	/** Invoke a method and await response */
	readonly invoke: (
		channel: string,
		args: ReadonlyArray<unknown>,
	) => Promise<unknown>;

	/** Subscribe to events on a channel */
	readonly events: (channel: string) => IPCEventStream;

	/** One-shot event listener */
	readonly once: (
		channel: string,
		callback: IPCEventListener,
	) => Promise<void>;

	/** Remove all listeners for a channel */
	readonly removeAllListeners: (channel: string) => void;
}
