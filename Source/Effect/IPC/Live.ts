/**
 * @module Effect/IPC/Live
 * @description
 * Live layer for the IPC service using Tauri's IPC APIs.
 * @category Layer
 */

import { Layer } from "effect";

import { TauriIPCLive } from "./Implementation/TauriIPC.js";

import { IPCTag } from "./Tag/IPCTag.js";

/**
 * Tauri IPC service layer
 */
export const IPCTauriLive = Layer.succeed(IPCTag, TauriIPCLive);

export default IPCTauriLive;
