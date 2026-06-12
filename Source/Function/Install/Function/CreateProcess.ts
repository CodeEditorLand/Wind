/**
 * @module Function/Install/Function/CreateProcess
 * @description
 * Factory function that creates a sandbox node process interface compatible with VSCode.
 * Provides platform-specific environment information and process details.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

import type { ISandboxConfiguration } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/sandbox/common/sandboxTypes.js";
import type { ISandboxNodeProcess } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/sandbox/electron-browser/globals.js";

/**
 * Creates a sandbox node process interface
 */
export function CreateProcess(
	Configuration: ISandboxConfiguration,
): ISandboxNodeProcess {
	return {
		platform: "web",

		arch: "web",

		type: "renderer",

		execPath: "/",

		env: Configuration.userEnv ?? {},

		cwd: () => "/",

		versions: {
			node: "20.0.0",

			chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",

			electron: "0.0.0",
		},

		on: (_Type: string, _Callback: Function): void => {},

		getProcessMemoryInfo: async () => ({
			private: 0,
			residentSet: 0,
			shared: 0,
		}),

		shellEnv: async () => ({}),
	};
}
