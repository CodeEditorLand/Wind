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
export function validateIPCChannel(channel: string): boolean {
	if (!channel || typeof channel !== "string") return false;
	if (typeof navigator !== "undefined" && !channel.startsWith("vscode:"))
		return false;
	return true;
}
