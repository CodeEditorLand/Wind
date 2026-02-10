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
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";

import { validateIPCChannel } from "./ValidateIPCChannel.js";

/**
 * Creates an IPC renderer interface
 */
export function createIPCRenderer(): IpcRenderer {
	const self: IpcRenderer = {
		send: (channel: string): void => {
			if (!validateIPCChannel(channel)) return;
		},
		invoke: async (channel: string): Promise<unknown> => {
			if (!validateIPCChannel(channel)) {
				throw new Error(`Invalid IPC channel: ${channel}`);
			}
			return {};
		},
		on: (
			_channel: string,
			_listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
		once: (
			_channel: string,
			_listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
		removeListener: (
			_channel: string,
			_listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
	};
	return self;
}
