/*
 * File: Wind/Source/workbench/electron-sandbox/desktop.main.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:09 UTC
 * Dependency: ../browser/workbench.js, effect, vs/base/browser/dom.js, vs/base/browser/window.js, vs/base/common/errors.js, vs/platform/instantiation/common/serviceCollection.js, vs/platform/log/common/log.js, vs/platform/product/common/product.js, vs/platform/product/common/productService.js
 */

import { Effect, Layer, Runtime } from "effect";
import { domContentLoaded } from "vs/base/browser/dom.js";
import { mainWindow } from "vs/base/browser/window.js";
import { onUnexpectedError } from "vs/base/common/errors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { ILogService } from "vs/platform/log/common/log.js";
import product from "vs/platform/product/common/product.js";
import { IProductService } from "vs/platform/product/common/productService.js";

import {
	AppLayer,
	InstantiationServiceTag,
	LogServiceTag,
	NativeHostServiceTag,
} from "../../Application/Main.js";
// A new Main aggregator for Application
import { Workbench } from "../browser/workbench.js";

const Main = Effect.gen(function* (_) {
	// Build the runtime with all our native services
	const AppRuntime = yield* _(Layer.toRuntime(AppLayer));
	const AppContext = Runtime.context(AppRuntime);

	// Resolve essential services required for startup
	const InstantiationService = AppContext.get(InstantiationServiceTag);
	const LogService = AppContext.get(LogServiceTag);
	const NativeHostService = AppContext.get(NativeHostServiceTag);

	// Wait for the DOM to be ready
	yield* _(Effect.promise(() => domContentLoaded(mainWindow)));

	// Create a temporary service collection for the Workbench constructor.
	// The real DI is handled by our TauriInstantiationService which is backed by Layers.
	const serviceCollection = new ServiceCollection(
		[IProductService, { _serviceBrand: undefined, ...product }],
		[ILogService, LogService],
	);

	// Create and start the Workbench
	try {
		const workbench = new Workbench(
			mainWindow.document.body,
			{}, // No extra options
			serviceCollection,
			LogService,
		);

		// The original `startup` method returns an `IInstantiationService`. We call it,
		// but our application will use the one we created from the context. The key is
		// that we've replaced all the `registerSingleton` services with our Layers.
		workbench.startup();

		// Signal to the native host that we are ready
		yield* _(Effect.promise(() => NativeHostService.notifyReady()));
	} catch (error) {
		onUnexpectedError(error as Error);
		throw error;
	}
});

// Run the main application Effect
Effect.runFork(Main);
