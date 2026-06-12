/**
 * @module Effect/NetworkRestrictions/Error/NetworkBlockError
 * @description
 * Error thrown when a network URL request is blocked by the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

/**
 * Error thrown when a network request is blocked
 */
export class NetworkBlockError extends Error {
	readonly _tag = "NetworkBlockError";

	readonly url: string;

	readonly reason: string;

	constructor(url: string, reason: string) {
		super(`Network request blocked: ${reason}`);

		this.url = url;

		this.reason = reason;

		this.cause = url;

		Object.setPrototypeOf(this, NetworkBlockError.prototype);
	}

	override get name() {
		return "NetworkBlockError";
	}
}

/**
 * Creates a NetworkBlockError instance
 * @param url - The blocked URL
 * @param reason - The reason for blocking
 * @returns A NetworkBlockError instance
 */
const CreateNetworkBlockError = (
	url: string,

	reason: string,
): NetworkBlockError => new NetworkBlockError(url, reason);

export default CreateNetworkBlockError;
