/**
 * @module Function/Install
 * @description
 * Re-exports the main Install function from the Install/ subfolder.
 * This file exists because Sky's WindPreload.ts imports
 * "@codeeditorland/wind/Target/Function/Install" which resolves
 * to this flat file (Install.ts) before the folder (Install/index.ts).
 */
export { default } from "./Install/Function/Install.js";
export { Install } from "./Install/Function/Install.js";
export { ResolveConfiguration } from "./Install/Function/ResolveConfiguration.js";
export { CreateIPCRenderer } from "./Install/Function/CreateIPCRenderer.js";
export { CreateProcess } from "./Install/Function/CreateProcess.js";
export { ValidateIPCChannel } from "./Install/Function/ValidateIPCChannel.js";
export { Fallback } from "./Install/Function/Fallback.js";
