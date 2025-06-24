/*
 * File: Wind/Source/Index.ts
 * Role: Main Entry Point for the Wind Package
 * Responsibilities:
 *   - This file serves as the primary entry point for the "Wind" package when imported
 *     as a module by the Sky/Astro application.
 *   - Its main responsibility is to import and execute the `Bridge.ts` script,
 *     which initializes the `window.vscode` global object necessary for the VS Code
 *     workbench to function in a webview environment.
 */

// The primary action is to ensure the host bridge is set up.
// Importing it here will execute the script and attach `window.vscode`.
import "./Bridge.js";

console.log(
	"[Wind Package] Main entry point executed. Sky Host Bridge should now be initialized on window.vscode.",
);
