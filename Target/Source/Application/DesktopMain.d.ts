/**
 * @module DesktopMain (Application)
 * @description Main entry point for the Wind Workbench UI. This module
 * orchestrates the entire startup sequence of the frontend application using a
 * pure, declarative Effect workflow.
 *
 * Responsibilities:
 *   - Defines the top-level `Main` Effect that describes the application's startup logic.
 *   - Waits for the DOM to be ready before initializing the UI.
 *   - Builds and provides the master `AppLayer` to satisfy all service dependencies.
 *   - Initializes and runs the core `Workbench` logic.
 *   - Sets up global error handling and gracefully runs the application.
 */
export {};
