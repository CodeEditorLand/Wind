/**
 * @module Effect/IPC/Error/IPCError
 * @description
 * Error types for IPC operations. Includes InvokeError, SendError, and SubscriptionError.
 * @see {@link Effect/IPC/Implementation/IPCImplementation} Usage context
 * @category Error
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Error thrown when IPC invoke fails
 */
export interface IPCInvokeError {
	readonly _tag: "IPCInvokeError";
	readonly channel: string;
	readonly cause: unknown;
	readonly message: string;
	readonly name: string;
}

/**
 * Error thrown when IPC send fails
 */
export interface IPCSendError {
	readonly _tag: "IPCSendError";
	readonly channel: string;
	readonly cause: unknown;
	readonly message: string;
	readonly name: string;
}

/**
 * Error thrown when IPC subscription fails
 */
export interface IPCSubscriptionError {
	readonly _tag: "IPCSubscriptionError";
	readonly channel: string;
	readonly cause: unknown;
	readonly message: string;
	readonly name: string;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Creates an IPCInvokeError instance
 */
const CreateIPCInvokeError = (
	channel: string,
	cause: unknown,
): IPCInvokeError => ({
	_tag: "IPCInvokeError",
	channel,
	cause,
	message: `IPC invoke failed on channel '${channel}': ${String(cause)}`,
	name: "IPCInvokeError",
});

/**
 * Creates an IPCSendError instance
 */
const CreateIPCSendError = (channel: string, cause: unknown): IPCSendError => ({
	_tag: "IPCSendError",
	channel,
	cause,
	message: `IPC send failed on channel '${channel}': ${String(cause)}`,
	name: "IPCSendError",
});

/**
 * Creates an IPCSubscriptionError instance
 */
const CreateIPCSubscriptionError = (
	channel: string,
	cause: unknown,
): IPCSubscriptionError => ({
	_tag: "IPCSubscriptionError",
	channel,
	cause,
	message: `IPC subscription failed on channel '${channel}': ${String(cause)}`,
	name: "IPCSubscriptionError",
});

export { CreateIPCInvokeError, CreateIPCSendError, CreateIPCSubscriptionError };

export default {
	CreateIPCInvokeError,
	CreateIPCSendError,
	CreateIPCSubscriptionError,
};
