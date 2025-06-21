/**
 * @module DesktopMain (Application)
 * @description The main entry point for the Wind Workbench UI. This script orchestrates
 * the entire startup sequence, from waiting for the DOM to be ready, to composing
 * the application's service layers, and finally instantiating and launching the
 * main `Workbench` class.
 */

import { Effect, Layer, Runtime } from "effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { mainWindow } from "vs/base/browser/window.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IProductService } from "vs/platform/product/common/product.js";

import { Workbench } from "../../workbench/browser/workbench.js";
import { NativeHostServiceTag } from "./Host/NativeTag.js";
import { AppLayer } from "./Instantiation/Layer.js";
import { InstantiationServiceTag } from "./Instantiation/mod.js";

/**
 * The main application startup workflow, described as a single, declarative `Effect`.
 */
const MainEffect = Effect.gen(function* (_) {
	// 1. Ensure the DOM is fully loaded and ready for manipulation.
	yield* _(Effect.promise(() => domContentLoaded(mainWindow)));
	yield* _(Effect.logInfo("DOM content loaded. Initializing workbench..."));

	// 2. Build the live application runtime by resolving the master `AppLayer`.
	// This step constructs and wires together all of our application services.
	const AppRuntime = yield* _(Layer.toRuntime(AppLayer));
	const AppContext = Runtime.context(AppRuntime);

	// 3. Resolve the essential services needed to bootstrap the legacy `Workbench` class.
	// Our modern services are already available in `AppContext`.
	const InstantiationService = AppContext.get(InstantiationServiceTag);
	const LogService = AppContext.get(ILogService);
	const NativeHostService = AppContext.get(NativeHostServiceTag);
	const ProductService = AppContext.get(IProductService);

	// 4. Create a `ServiceCollection` as a compatibility bridge for the `Workbench` constructor,
	// which still uses this older pattern for some of its dependencies.
	const ServiceCollectionBridge = new ServiceCollection(
		[IProductService, ProductService],
		[ILogService, LogService],
	);

	try {
		// 5. Instantiate the main `Workbench` class from VS Code's source.
		const WorkbenchInstance = new Workbench(
			mainWindow.document.body,
			{},
			ServiceCollectionBridge,
			LogService,
		);

		// 6. Call `startup()` to kick off the UI rendering lifecycle.
		WorkbenchInstance.startup();

		// 7. Signal to the native host (`Mountain`) that the UI is ready.
		yield* _(Effect.promise(() => NativeHostService.notifyReady()));

		yield* _(
			Effect.logInfo(
				"Wind Workbench successfully launched and is operational.",
			),
		);
	} catch (error) {
		// If the imperative `Workbench` constructor or `startup` throws,
		// we catch the error, log it, and terminate our Effect workflow with a "defect".
		onUnexpectedError(error as Error);
		yield* _(Effect.die(error));
	}
});

// Fork the main application effect to run it.
Effect.runFork(MainEffect);
