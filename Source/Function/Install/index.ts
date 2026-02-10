/**
 * @module Function/Install
 * @description
 * Main re-export module for Wind polyfill installation functions.
 */

// Main installation function
export { default } from "./Function/Install.js";
export { default as Install } from "./Function/Install.js";

// Helper functions
export { createIPCRenderer } from "./Function/CreateIPCRenderer.js";
export { createProcess } from "./Function/CreateProcess.js";
export { resolveConfiguration } from "./Function/ResolveConfiguration.js";
export { validateIPCChannel } from "./Function/ValidateIPCChannel.js";
export { fallback } from "./Function/Fallback.js";
