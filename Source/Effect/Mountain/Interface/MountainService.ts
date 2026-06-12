/**
 * @module Effect/Mountain/Interface/MountainService
 * @description
 * Service interface for Mountain backend integration.
 * Manages connection, RPC calls, and resource synchronization.
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Default implementation
 * @category Interface
 */

import type {
	MountainConnectionState,
	SyncResource,
	SyncResult,
} from "../Type/MountainType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Handle returned by subscription methods; call `dispose` to unsubscribe.
 */
export interface IDisposable {

	readonly dispose: () => void;
}

/**
 * Service interface for Mountain backend operations.
 * Manages connection to the Mountain backend, RPC calls, and resource sync.
 */
export interface MountainService {

	/**
	 * Current connection state snapshot.
	 */
	readonly connectionState: () => MountainConnectionState;

	/**
	 * Subscribe to connection state changes.
	 * @param Listener - Called with each new connection state
	 */
	readonly onConnectionChange: (
		Listener: (State: MountainConnectionState) => void,
	) => IDisposable;

	/**
	 * Connect to Mountain backend with capped exponential retry.
	 * @throws MountainConnectionError after the retry budget is exhausted
	 */
	readonly connect: () => Promise<void>;

	/**
	 * Disconnect from Mountain backend and stop background sync.
	 */
	readonly disconnect: () => void;

	/**
	 * Execute RPC method.
	 * @param Method - The RPC method name
	 * @returns A function that takes args and resolves to the RPC result
	 * @throws MountainRPCError when the call fails
	 */
	readonly rpc: <T>(
		Method: string,
	) => (Args?: Record<string, unknown>) => Promise<T>;

	/**
	 * Sync a specific resource type.
	 * @param ResourceType - The type of resource to sync
	 * @throws MountainSyncError when the sync fails
	 */
	readonly sync: (ResourceType: SyncResource["type"]) => Promise<SyncResult>;

	/**
	 * Subscribe to sync events.
	 * @param Listener - Called with each synced resource
	 */
	readonly onSyncEvent: (
		Listener: (Resource: SyncResource) => void,
	) => IDisposable;

	/**
	 * Get Mountain version.
	 * @throws MountainConnectionError when the backend is unreachable
	 */
	readonly version: () => Promise<string>;

	/**
	 * Health check; resolves to whether the backend is healthy.
	 */
	readonly healthCheck: () => Promise<boolean>;

	/**
	 * Cancel retry/background loops and drop all listeners.
	 */
	readonly dispose: () => void;
}
