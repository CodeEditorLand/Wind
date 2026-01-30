/**
 * @module Preload
 * @description
 * Main preload script for Wind - creates VSCode-compatible environment in Tauri webview.
 * This script runs before all other page content and sets up the window.vscode API shim.
 *
 * Architecture:
 * 1. Set up Electron API shims (ipcRenderer, process, etc.)
 * 2. Initialize window.vscode global object
 * 3. Load bootstrap configuration from Mountain backend
 * 4. Prepare workbench initialization
 */
export {};
//# sourceMappingURL=Preload.d.ts.map