/**
 * @module Bridge (Wind)
 * @description This script runs in the webview environment at a very early
 * stage. Its primary purpose is to create and expose a global `window.vscode`
 * object. This object shims the essential APIs that VS Code's sandboxed
 * workbench code expects from an Electron environment, redirecting them to use
 * Tauri's IPC mechanism.
 */
export {};
