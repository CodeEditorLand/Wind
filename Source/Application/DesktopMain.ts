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

import { Effect, Layer, Runtime } from "effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";
import {
	IQuickAccessRegistry,
	Extensions as QuickAccessExtensions,
} from "vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "vs/platform/registry/common/platform.js";
import { CommandsQuickAccessProvider } from "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";

// Import the master application layer.
import { AppLayer } from "./Layer.js";

// Import core services needed for the startup sequence.
import { HostService } from "./Host/Service.js";
import { TreeViewService } from "./TreeView/Service.js";
import { NativeTreeViewDataProvider } from "./TreeView/Definition.js";

// This is a placeholder for the real Workbench class from VS Code's sources.
// In a real scenario, this would be imported.
class Workbench {
	constructor(_target: HTMLElement, _options: any, _serviceCollection: any) {}
	startup(): void {
		console.log("[Workbench] Startup called.");
	}
}

/**
 * The main application startup workflow, described as a single, declarative `Effect`.
 * This effect orchestrates the entire initialization process, from waiting for the
 * DOM to be ready to launching the main workbench UI.
 */
const Main = Effect.gen(function* (Generator) {
	// 1. Ensure the DOM is fully loaded and ready for manipulation before
	//    attempting to create any UI components.
	yield* Generator(Effect.promise(() => domContentLoaded(window)));
	yield* Generator(
		Effect.logInfo("DOM content loaded. Initializing services..."),
	);

	// 2. Resolve essential services from the context provided by AppLayer.
	const Host = yield* Generator(HostService);
	const LogService = yield* Generator(ILogService);
	const ProductService = yield* Generator(IProductService);
	const TreeView = yield* Generator(TreeViewService);
	// NOTE: In a full implementation, we would resolve a real InstantiationService
	// that is itself a service provided in the AppLayer. For now, we mock it.
	const MockInstantiationService = {
		createInstance: <T>(
			ctor: new (...args: any[]) => T,
			...args: any[]
		): T => new ctor(...args),
	};

	yield* Generator(Effect.logInfo("Core services resolved."));

	// 3. Execute the critical side-effect of providing the global `window.vscode`
	//    shim. This must happen before the `Workbench` class is instantiated.
	yield* Generator(Host.ProvideGlobals());
	yield* Generator(Effect.logInfo("Host bridge globals have been provided."));

	// 4. Register statically known UI components and providers. This is equivalent
	//    to the registration phase in the original `desktop.main.ts`.
	const QuickAccessRegistry = Registry.as<IQuickAccessRegistry>(
		QuickAccessExtensions.Quickaccess,
	);
	const CommandsProvider = MockInstantiationService.createInstance(
		CommandsQuickAccessProvider,
		{}, // Empty options
	);
	QuickAccessRegistry.registerQuickAccessProvider(CommandsProvider);
	yield* Generator(
		Effect.logInfo("Command QuickAccess Provider registered."),
	);

	// Register the native TreeView provider for the file explorer.
	const ExplorerProvider = new NativeTreeViewDataProvider(
		"workbench.view.explorer",
	);
	TreeView.registerTreeDataProvider(
		"workbench.view.explorer",
		ExplorerProvider,
	);
	yield* Generator(
		Effect.logInfo("File Explorer native data provider registered."),
	);

	// 5. Instantiate and launch the main `Workbench` UI.
	//    This is the primary side-effect that renders the application.
	yield* Generator(
		Effect.try({
			try: () => {
				const WorkbenchInstance = new Workbench(
					document.body,
					{}, // Empty workbench options
					// The legacy ServiceCollection is no longer the source of truth.
					// We pass a dummy collection for compatibility.
					[],
				);
				WorkbenchInstance.startup();
			},
			catch: (error) => {
				// Use the VS Code-provided error handler for UI-related exceptions.
				onUnexpectedError(error as Error);
				// We still want to fail the main Effect so it can be logged.
				return error as Error;
			},
		}),
	);

	// 6. Notify the native host (`Mountain`) that the UI is ready and operational.
	yield* Generator(Host.NotifyReady());
	yield* Generator(
		Effect.logInfo(
			"Wind Workbench successfully launched and is operational.",
		),
	);

	// 7. The application now runs indefinitely until an exit signal is received.
	yield* Generator(Effect.never);
}).pipe(
	// Wrap the entire application logic in a single top-level error boundary.
	Effect.catchAllCause((Cause) =>
		Effect.logFatal(
			"A critical error occurred in the main application.",
			Cause,
		),
	),
);

/**
 * The final, executable `Effect` for the application.
 *
 * We provide the `AppLayer`, which supplies all the necessary service
 * implementations to the `Main` effect. The `Effect.scoped` ensures that all
 * resources acquired within the layers are gracefully released on shutdown.
 */
const Executable = Main.pipe(Effect.provide(AppLayer), Effect.scoped);

// --- Application Execution ---

// Run the main application effect using the default Effect runtime.
// This is the one and only `run` call in the entire application.
Runtime.runMain(Executable);
