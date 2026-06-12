/**
 * @module Function/Install/Function/CreateIPCRenderer
 * @description
 * Factory function that creates an IPC renderer interface compatible with VSCode's preload.
 * Provides send/invoke/on/once/removeListener methods for IPC communication.
 *
 * @see {@link Function/Install/Function/ValidateIPCChannel} Channel validator
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/sandbox/electron-browser/electronTypes.js";

import { ValidateIPCChannel } from "./ValidateIPCChannel.js";

/**
 * Creates an IPC renderer interface
 */
export function CreateIPCRenderer(): IpcRenderer {
	const self: IpcRenderer = {
		send: (Channel: string): void => {
			if (!ValidateIPCChannel(Channel)) return;
		},

		invoke: async (Channel: string): Promise<unknown> => {
			if (!ValidateIPCChannel(Channel)) {
				throw new Error(`Invalid IPC channel: ${Channel}`);
			}

			return {};
		},

		on: (
			_Channel: string,

			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},

		once: (
			_Channel: string,

			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},

		removeListener: (
			_Channel: string,

			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
	};

	return self;
}
