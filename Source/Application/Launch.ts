/**
 * @module Launch
 * @description
 * Main entry point for the Wind Workbench UI. This module orchestrates the
 * entire startup sequence of the frontend application using a single, declarative
 * Effect workflow.
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

import { ApplicationLayer } from "./Compose.js";
import { HostService } from "./Host/Define.js";
import { IntegrationService } from "./Integration/Define.js";
import {
	NativeTreeViewDataProvider,
	TreeViewService,
} from "./TreeView/Define.js";

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
	const Logger = yield* Generator(ILogService);
	const TreeView = yield* Generator(TreeViewService);
	const Integration = yield* Generator(IntegrationService);
	// In a complete implementation, we would yield* the real IInstantiationService
	const InstantiationService = {
		createInstance: <T>(
			ctor: new (...args: any[]) => T,
			...args: any[]
		): T => new ctor(...args),
	};
	yield* Generator(Effect.logInfo("Core services resolved."));

	// 3. Initialize reactive services that listen for host events.
	// These are forked as daemons to run in the background.
	// Example: yield* Generator(Effect.forkDaemon(MarkerService.Initialize()));

	// 4. Register statically known UI providers.
	const QuickAccessRegistry = Registry.as<IQuickAccessRegistry>(
		QuickAccessExtensions.Quickaccess,
	);
	QuickAccessRegistry.registerQuickAccessProvider({
		ctor: CommandsQuickAccessProvider as any,
		prefix: CommandsQuickAccessProvider.PREFIX,
		helpEntries: [],
	});
	yield* Generator(
		Effect.logInfo("Command QuickAccess Provider registered."),
	);

	// Register the native TreeView provider for the file explorer.
	const ExplorerProvider = new NativeTreeViewDataProvider(
		"workbench.view.explorer",
		Integration,
		Logger,
	);
	TreeView.registerTreeDataProvider(
		"workbench.view.explorer",
		ExplorerProvider,
	);
	yield* Generator(
		Effect.logInfo("File Explorer native data provider registered."),
	);

	// 5. Instantiate and launch the main `Workbench` UI.
	yield* Generator(
		Effect.try({
			try: () => {
				const ProductService = {
					_serviceBrand: undefined,
					...(Effect.runSync(IProductService) as object), // Assuming a default implementation
				};
				const ServiceCollectionBridge = new ServiceCollection(
					[IProductService, ProductService],
					[ILogService, Logger],
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
		}),
	);

	// 6. Notify the native host that the UI is ready and operational.
	yield* Generator(Host.NotifyReady());
	yield* Generator(
		Effect.logInfo(
			"Wind Workbench successfully launched and is operational.",
		),
	);

	// 7. The application now runs indefinitely.
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
 * We provide the `ApplicationLayer`, which supplies all the necessary service
 * implementations to the `Main` effect. The `Effect.scoped` ensures that all
 * resources acquired within the layers are gracefully released on shutdown.
 */
const Executable = Main.pipe(Effect.provide(ApplicationLayer), Effect.scoped);

// --- Application Execution ---
Effect.runFork(Executable);
