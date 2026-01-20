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

import { domContentLoaded } from "@codeeditorland/output/vs/base/browser/dom.js";
import { onUnexpectedError } from "@codeeditorland/output/vs/base/common/errors.js";
import { ServiceCollection } from "@codeeditorland/output/vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import {
	Extensions as QuickAccessExtensions,
	type IQuickAccessRegistry,
} from "@codeeditorland/output/vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "@codeeditorland/output/vs/platform/registry/common/platform.js";
import { Workbench } from "@codeeditorland/output/vs/workbench/browser/workbench.js";
import { CommandsQuickAccessProvider } from "@codeeditorland/output/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";
import { Effect } from "effect";

import { IntegrationService } from "../Integration/Tauri/Service.js";
import { HostService } from "./Host/Service.js";
// Import the master application layer and core services.
import { AppLayer } from "./Layer.js";
import { MarkerService } from "./Marker/Define.js";
import {
	NativeTreeViewDataProvider,
	TreeViewService,
} from "./TreeView/Define.js";

/**
 * The main application startup workflow, described as a single, declarative `Effect`.
 * This effect orchestrates the entire initialization process, from waiting for the
 * DOM to be ready to launching the main workbench UI.
 */
const Main = Effect.gen(function* () {
	// 1. Ensure the DOM is fully loaded and ready for manipulation.
	yield* Effect.promise(() => domContentLoaded(window));
	yield* Effect.logInfo("DOM content loaded. Initializing services...");

	// 2. Resolve essential services from the context provided by AppLayer.
	const Host = yield* HostService;
	const LoggerService = yield* ILogService;
	const Marker = yield* MarkerService;
	const TreeView = yield* TreeViewService;
	const Integration = yield* IntegrationService;

	// This is a placeholder for a real InstantiationService bridge. For now, it's
	// a mock that allows us to instantiate legacy VS Code classes.
	const MockInstantiationService = {
		createInstance: <T>(
			ctor: new (...args: any[]) => T,
			...args: any[]
		): T => new ctor(...args),
	};
	const InstantiationService = MockInstantiationService; // Alias for clarity

	yield* Effect.logInfo("Core services resolved.");

	// 3. Execute the critical side-effect of providing the global `window.vscode`
	//    shim. This must happen before the `Workbench` class is instantiated.
	yield* Host.ProvideGlobals();
	yield* Effect.logInfo("Host bridge globals have been provided.");

	// 4. Initialize reactive services that listen for host events. These are
	//    forked as daemons to run in the background throughout the application's lifecycle.
	yield* Effect.forkDaemon(Marker.Initialize());
	yield* Effect.logInfo(
		"MarkerService initialized and listening for diagnostics.",
	);

	// 5. Register statically known UI providers.
	const QuickAccessRegistry = Registry.as<IQuickAccessRegistry>(
		QuickAccessExtensions.Quickaccess,
	);
	const CommandsProvider = InstantiationService.createInstance(
		CommandsQuickAccessProvider,
		{},
	);
	QuickAccessRegistry.registerQuickAccessProvider({
		ctor: function (...args: any[]): any {
			return new CommandsQuickAccessProvider(...(args as [any, any]));
		},
		prefix: CommandsQuickAccessProvider.PREFIX,
		helpEntries: [],
	});
	yield* Effect.logInfo("Command QuickAccess Provider registered.");

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
	yield* Effect.logInfo("File Explorer native data provider registered.");

	// 6. Instantiate and launch the main `Workbench` UI.
	yield* Effect.try({
		try: () => {
			const ProductService = {
				_serviceBrand: undefined,
				...(Effect.runSync(IProductService) as object),
			};
			// A real implementation would lift more services into this collection.
			const ServiceCollectionBridge = new ServiceCollection(
				[IProductService, ProductService],
				[ILogService, LoggerService],
			);

			const WorkbenchInstance = InstantiationService.createInstance(
				Workbench,
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
	});

	// 7. Notify the native host (`Mountain`) that the UI is ready and operational.
	yield* Host.NotifyReady();
	yield* Effect.logInfo(
		"Wind Workbench successfully launched and is operational.",
	);

	// 8. The application now runs indefinitely.
	yield* Effect.never;
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
Effect.runFork(Executable);
