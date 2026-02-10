/**
 * @module Effect/NetworkRestrictions/Error/NetworkBlockError
 * @description
 * Error thrown when a network URL request is blocked by the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @see [Error Handling Guide](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Error thrown when a network request is blocked
 */
export interface NetworkBlockError {
	readonly _tag: "NetworkBlockError";
	readonly url: string;
	readonly reason: string;
	readonly message: string;
	readonly name: string;
	readonly cause: string;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Creates a NetworkBlockError instance
 * @param url - The blocked URL
 * @param reason - The reason for blocking
 * @returns A NetworkBlockError instance
 */
const createNetworkBlockError = (url: string, reason: string): NetworkBlockError => ({
	_tag: "NetworkBlockError",
	url,
	reason,
	message: `Network request blocked: ${reason}`,
	name: "NetworkBlockError",
	cause: url,
});

export default createNetworkBlockError;
