/**
 * @module Function/Install/Function/ValidateIPCChannel
 * @description
 * Validates IPC channel names to ensure they meet VSCode security requirements.
 * Only allows channels starting with "vscode:" prefix.
 *
 * @see {@link Function/Install/Function/CreateIPCRenderer} IPC renderer factory
 * @category Function
 */

/**
 * Validates IPC channel names
 */
export function ValidateIPCChannel(Channel: string): boolean {
	if (!Channel || typeof Channel !== "string") return false;

	if (typeof navigator !== "undefined" && !Channel.startsWith("vscode:"))
		return false;

	return true;
}
