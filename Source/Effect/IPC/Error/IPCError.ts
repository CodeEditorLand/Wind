/**
 * @module Effect/IPC/Error/IPCError
 * @description
 * Error types for IPC operations. Includes InvokeError, SendError, and SubscriptionError.
 * @see {@link Effect/IPC/Implementation/IPCImplementation} Usage context
 * @category Error
 */

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Error thrown when IPC invoke fails
 */
export class IPCInvokeError extends Error {
	readonly _tag = "IPCInvokeError" as const;

	readonly channel: string;

	readonly cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(`IPC invoke failed on channel '${channel}': ${String(cause)}`);

		this.channel = channel;

		this.cause = cause;

		Object.setPrototypeOf(this, IPCInvokeError.prototype);
	}

	override get name() {
		return "IPCInvokeError";
	}
}

/**
 * Error thrown when IPC send fails
 */
export class IPCSendError extends Error {
	readonly _tag = "IPCSendError" as const;

	readonly channel: string;

	readonly cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(`IPC send failed on channel '${channel}': ${String(cause)}`);

		this.channel = channel;

		this.cause = cause;

		Object.setPrototypeOf(this, IPCSendError.prototype);
	}

	override get name() {
		return "IPCSendError";
	}
}

/**
 * Error thrown when IPC subscription fails
 */
export class IPCSubscriptionError extends Error {
	readonly _tag = "IPCSubscriptionError" as const;

	readonly channel: string;

	readonly cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(
			`IPC subscription failed on channel '${channel}': ${String(cause)}`,
		);

		this.channel = channel;

		this.cause = cause;

		Object.setPrototypeOf(this, IPCSubscriptionError.prototype);
	}

	override get name() {
		return "IPCSubscriptionError";
	}
}
