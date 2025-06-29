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
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";
import {
	Extensions as QuickAccessExtensions,
	IQuickAccessRegistry,
} from "vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "vs/platform/registry/common/platform.js";
import { Workbench } from "vs/workbench/browser/workbench.js";
import { CommandsQuickAccessProvider } from "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";

// Import the master application layer and core services.
import { AppLayer } from "./Layer.js";
import { HostService } from "./Host/Service.js";
import { MarkerService } from "./Marker/Service.js";
import {
	TreeViewService,
	NativeTreeViewDataProvider,
} from "./TreeView/Service.js";
import { IntegrationService } from "../Integration/Tauri/Service.js";

/**
 * The main application startup workflow, described as a single, declarative `Effect`.
 * This effect orchestrates the entire initialization process, from waiting for the
 * DOM to be ready to launching the main workbench UI.
 */
const Main = Effect.gen(function* (Generator) {
	// 1. Ensure the DOM is fully loaded and ready for manipulation.
	yield* Generator(Effect.promise(() => domContentLoaded(window)));
	yield* Generator(
		Effect.logInfo("DOM content loaded. Initializing services..."),
	);

	// 2. Resolve essential services from the context provided by AppLayer.
	const Host = yield* Generator(HostService);
	const LoggerService = yield* Generator(ILogService);
	const Marker = yield* Generator(MarkerService);
	const TreeView = yield* Generator(TreeViewService);
	const Integration = yield* Generator(IntegrationService);

	// This is a placeholder for a real InstantiationService bridge. For now, it's
	// a mock that allows us to instantiate legacy VS Code classes.
	const MockInstantiationService = {
		createInstance: <T>(
			ctor: new (...args: any[]) => T,
			...args: any[]
		): T => new ctor(...args),
	};
	const InstantiationService = MockInstantiationService; // Alias for clarity

	yield* Generator(Effect.logInfo("Core services resolved."));

	// 3. Execute the critical side-effect of providing the global `window.vscode`
	//    shim. This must happen before the `Workbench` class is instantiated.
	yield* Generator(Host.ProvideGlobals());
	yield* Generator(Effect.logInfo("Host bridge globals have been provided."));

	// 4. Initialize reactive services that listen for host events. These are
	//    forked as daemons to run in the background throughout the application's lifecycle.
	yield* Generator(Effect.forkDaemon(Marker.Initialize()));
	yield* Generator(
		Effect.logInfo(
			"MarkerService initialized and listening for diagnostics.",
		),
	);

	// 5. Register statically known UI providers.
	const QuickAccessRegistry = Registry.as<IQuickAccessRegistry>(
		QuickAccessExtensions.Quickaccess,
	);
	const CommandsProvider = InstantiationService.createInstance(
		CommandsQuickAccessProvider,
		{},
	);
	QuickAccessRegistry.registerQuickAccessProvider(CommandsProvider);
	yield* Generator(
		Effect.logInfo("Command QuickAccess Provider registered."),
	);

	// Register the native TreeView provider for the file explorer.
	const ExplorerProvider = new NativeTreeViewDataProvider(
		"workbench.view.explorer",
		Integration,
		LoggerService,
	);
	TreeView.registerTreeDataProvider(
		"workbench.view.explorer",
		ExplorerProvider,
	);
	yield* Generator(
		Effect.logInfo("File Explorer native data provider registered."),
	);

	// 6. Instantiate and launch the main `Workbench` UI.
	yield* Generator(
		Effect.try({
			try: () => {
				const ProductService = {
					_serviceBrand: undefined,
					...(yield * Generator(IProductService)),
				};
				// A real implementation would lift more services into this collection.
				const ServiceCollectionBridge = new ServiceCollection(
					[IProductService, ProductService],
					[ILogService, LoggerService],
				);

				const WorkbenchInstance = new Workbench(
					document.body,
					{}, // Empty workbench options
					ServiceCollectionBridge,
				);
				WorkbenchInstance.startup();
			},
			catch: (error) => {
				onUnexpectedError(error as Error);
				return error as Error;
			},
		}),
	);

	// 7. Notify the native host (`Mountain`) that the UI is ready and operational.
	yield* Generator(Host.NotifyReady());
	yield* Generator(
		Effect.logInfo(
			"Wind Workbench successfully launched and is operational.",
		),
	);

	// 8. The application now runs indefinitely.
	yield* Generator(Effect.never);
}).pipe(
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
Runtime.runMain(Executable);
