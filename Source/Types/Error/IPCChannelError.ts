/**
 * @module Types/Error/IPCChannelError
 * @description
 * Error thrown when an IPC channel operation fails.
 * Includes the channel name and underlying cause.
 * @category Error
 */

/**
 * IPC channel error
 */
export class IPCChannelError extends Error {
	readonly _tag = "IPCChannelError";

	constructor(
		readonly channel: string,
		override readonly cause: unknown,
	) {
		super(`IPC channel '${channel}' error: ${String(cause)}`);
	}
}
