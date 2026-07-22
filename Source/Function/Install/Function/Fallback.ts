/**
 * @module Function/Install/Function/Fallback
 * @description
 * Implements graceful degradation with fallback support when Wind preload fails.
 * Attempts to use legacy bridge or provides minimal VSCode shim.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

/**
 * Implements graceful degradation with fallback support
 */
export function Fallback(): void {

	if (typeof (window as any).legacyBridge !== "undefined") {
		(window as any).vscode = (window as any).legacyBridge;

		return;
	}

	if (typeof (window as any).vscode === "undefined") {
		(window as any).vscode = {
			process: { platform: "web" },

			ipcRenderer: {
				send: () => {},

				invoke: async () => ({}),

				on: () => ({}),

				once: () => ({}),

				removeListener: () => ({}),

				removeAllListeners: () => {},
			},
		};
	}
}
