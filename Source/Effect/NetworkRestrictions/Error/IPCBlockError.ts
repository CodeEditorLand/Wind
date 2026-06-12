/**
 * @module Effect/NetworkRestrictions/Error/IPCBlockError
 * @description
 * Error thrown when an IPC channel is blocked by the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

/**
 * Error thrown when an IPC channel is blocked
 */
export class IPCBlockError extends Error {
	readonly _tag = "IPCBlockError";

	readonly channel: string;

	readonly reason: string;

	constructor(channel: string, reason: string) {
		super(`IPC channel blocked: ${reason}`);

		this.channel = channel;

		this.reason = reason;

		this.cause = channel;

		Object.setPrototypeOf(this, IPCBlockError.prototype);
	}

	override get name() {
		return "IPCBlockError";
	}
}

/**
 * Creates an IPCBlockError instance
 * @param channel - The blocked IPC channel
 * @param reason - The reason for blocking
 * @returns An IPCBlockError instance
 */
const CreateIPCBlockError = (
	channel: string,

	reason: string,
): IPCBlockError => new IPCBlockError(channel, reason);

export default CreateIPCBlockError;
