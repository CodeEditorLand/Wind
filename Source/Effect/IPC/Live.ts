/**
 * @module Effect/IPC/Live
 * @description
 * Live layer for the IPC service using Tauri's IPC APIs.
 * @category Layer
 */

import { Layer } from "effect";
import { IPCTag } from "./Tag/IPCTag.js";
import { TauriIPCLive } from "./Implementation/TauriIPC.js";

/**
 * Tauri IPC service layer
 */
export const IPCTauriLive = Layer.effect(IPCTag, TauriIPCLive);

export default IPCTauriLive;
