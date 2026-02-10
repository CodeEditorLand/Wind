/**
 * @module Function/Install/Function/CreateProcess
 * @description
 * Factory function that creates a sandbox node process interface compatible with VSCode.
 * Provides platform-specific environment information and process details.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

import type {
	ISandboxNodeProcess,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";

import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes';

/**
 * Creates a sandbox node process interface
 */
export function createProcess(
	configuration: ISandboxConfiguration,
): ISandboxNodeProcess {
	return {
		platform: "web",
		arch: "web",
		type: "renderer",
		execPath: "/",
		env: configuration.userEnv ?? {},
		cwd: () => "/",
		versions: {
			node: "20.0.0",
			chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",
			electron: "0.0.0",
		},
		on: (_type: string, _callback: Function): void => {},
		getProcessMemoryInfo: async () => ({
			private: 0,
			residentSet: 0,
			shared: 0,
		}),
		shellEnv: async () => ({}),
	};
}
