/*
 * File: Wind/Source/Application/DesktopMain.ts
 * Role: Main entry point for the Wind Workbench UI.
 * Responsibilities:
 *   - Orchestrate the entire startup sequence of the frontend application.
 *   - Wait for the DOM to be ready.
 *   - Build the Effect-TS dependency injection layer (`AppLayer`).
 *   - Use the `HostService` to set up the `window.vscode` bridge to the native host.
 *   - Register all statically known UI components (like the Command Palette provider).
 *   - Instantiate and launch the main VS Code `Workbench` class.
 */

import { Effect, Layer, Runtime } from "effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { mainWindow } from "vs/base/browser/window.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";
import {
	IQuickAccessRegistry,
	Extensions as QuickAccessExtensions,
} from "vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "vs/platform/registry/common/platform.js";
import { CommandsQuickAccessProvider } from "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.js";

import { Workbench } from "../../workbench/browser/workbench.js";
import { HostService } from "./Host/mod.js";
import { AppLayer } from "./Instantiation/Layer.js";
import { InstantiationServiceTag } from "./Instantiation/mod.js";
import { NativeTreeViewDataProvider } from "./TreeView/Definition.js";
import { TreeView } from "./TreeView/mod.js";

/**
 * The main application startup workflow, described as a single, declarative `Effect`.
 */
const MainEffect = Effect.gen(function* (_) {
	// 1. Ensure the DOM is fully loaded and ready for manipulation.
	yield* _(Effect.promise(() => domContentLoaded(mainWindow)));
	yield* _(Effect.logInfo("DOM content loaded. Initializing services..."));

	// 2. Build the entire application dependency graph.
	const AppRuntime = yield* _(Layer.toRuntime(AppLayer));
	const AppContext = Runtime.context(AppRuntime);

	// 3. Get the HostService and execute its side-effect to provide the global shims.
	// This is a critical step that must happen before the workbench is instantiated.
	const Host = AppContext.get(HostService.Tag);
	yield* _(Host.provideGlobals());
	yield* _(Effect.logInfo("Host bridge globals provided."));

	// 4. Resolve essential services needed for bootstrapping.
	const InstantiationService = AppContext.get(IInstantiationService);
	const LogService = AppContext.get(ILogService);
	const ProductService = AppContext.get(IProductService);
	const TreeViewService = AppContext.get(TreeView.Tag);
	yield* _(Effect.logInfo("Core services resolved."));

	// 5. Register statically known UI providers.
	const QuickAccessRegistry = Registry.as<IQuickAccessRegistry>(
		QuickAccessExtensions.Quickaccess,
	);
	const CommandsProvider = InstantiationService.createInstance(
		CommandsQuickAccessProvider,
		{}, // Empty options
	);
	QuickAccessRegistry.registerQuickAccessProvider(CommandsProvider);
	yield* _(Effect.logInfo("Command QuickAccess Provider registered."));

	const ExplorerProvider = new NativeTreeViewDataProvider(
		"workbench.view.explorer",
	);
	TreeViewService.registerTreeDataProvider(
		"workbench.view.explorer",
		ExplorerProvider,
	);
	yield* _(Effect.logInfo("File Explorer data provider registered."));

	// 6. Create a `ServiceCollection` as a compatibility bridge for legacy parts of the `Workbench`.
	const ServiceCollectionBridge = new ServiceCollection(
		[IProductService, ProductService],
		[ILogService, LogService],
	);

	try {
		// 7. Instantiate the main `Workbench` class from VS Code's source.
		const WorkbenchInstance = InstantiationService.createInstance(
			Workbench,
			mainWindow.document.body,
			{}, // Empty options
			ServiceCollectionBridge,
		);

		// 8. Call `startup()` to kick off the UI rendering lifecycle.
		WorkbenchInstance.startup();

		// 9. Signal to the native host (`Mountain`) that the UI is ready.
		yield* _(Host.notifyReady());

		yield* _(
			Effect.logInfo(
				"Wind Workbench successfully launched and is operational.",
			),
		);
	} catch (error) {
		onUnexpectedError(error as Error);
		yield* _(Effect.die(error));
	}
});

// Fork the main application effect to run it. This starts the entire application.
Effect.runFork(MainEffect);
