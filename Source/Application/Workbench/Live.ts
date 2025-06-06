// Source/Application/Workbench/Live.ts
import { Context, Effect, Layer, Stream } from "effect";
import {
	onUnexpectedError,
	setUnexpectedErrorHandler,
} from "vs/base/common/errors.js";
import { IConfigurationService } from "vs/platform/configuration/common/configuration.js";
import { getSingletonServiceDescriptors } from "vs/platform/instantiation/common/extensions.js";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IHostService } from "vs/workbench/services/host/browser/host.js";
import {
	ILifecycleService,
	LifecyclePhase,
} from "vs/workbench/services/lifecycle/common/lifecycle.js";

import { WorkbenchLayout } from "./Layout.js"; // This would be a refactored, functional version of the Layout class.
import WorkbenchTag, {
	LayoutServiceTag,
	type Interface as WorkbenchService,
} from "./Tag.js";

// This is the new main entry point for the workbench. It's a Layer.
const LiveWorkbench = Layer.scoped(
	WorkbenchTag,
	Effect.gen(function* (_) {
		// 1. All dependencies are required from the context.
		const LifecycleService = yield* _(Context.Tag<ILifecycleService>());
		const StorageService = yield* _(Context.Tag<IStorageService>());
		const ConfigService = yield* _(Context.Tag<IConfigurationService>());
		const HostService = yield* _(Context.Tag<IHostService>());
		const LogService = yield* _(Context.Tag<ILogService>());

		// 2. Initialize the DOM and Layout. This is now an Effect.
		const parentElement = document.body;
		const workbenchLayout = yield* _(WorkbenchLayout.make(parentElement)); // `make` returns a managed resource Effect
		yield* _(
			Effect.sync(() => {
				// Attach global error handlers.
				setUnexpectedErrorHandler((error) => LogService.error(error));
				window.addEventListener("unhandledrejection", (event) =>
					onUnexpectedError(event.reason),
				);
			}),
		);

		// 3. Create the legacy InstantiationService as a compatibility bridge.
		// As we refactor more services, the need for this diminishes.
		const services = new ServiceCollection(
			[IWorkbenchLayoutService, workbenchLayout],
			// ... other essential services for legacy parts
		);
		const instantiationService = new InstantiationService(services, true);

		// 4. Register listeners as a declarative Stream pipeline.
		const registerListenersEffect = Stream.mergeAll([
			// Stream for config changes
			Stream.fromEvent(ConfigService.onDidChangeConfiguration).pipe(
				Stream.flatMap((e) => workbenchLayout.updateFontAliasing(e)),
			),

			// Stream for lifecycle events
			Stream.fromEvent(LifecycleService.onWillShutdown).pipe(
				Stream.tap(() => workbenchLayout.storeFontInfo()),
			),

			// Stream for focus changes
			Stream.fromEvent(HostService.onDidChangeFocus).pipe(
				Stream.filter((isFocused) => !isFocused),
				Stream.flatMap(() => StorageService.flush()),
			),
		]).pipe(Stream.runDrain);

		// 5. Render the workbench parts. This is now a single Effect.
		const renderWorkbenchEffect = Effect.gen(function* (_) {
			workbenchLayout.addClasses(); // Apply CSS classes
			yield* _(workbenchLayout.restoreFontInfo());
			yield* _(workbenchLayout.createParts()); // Creates Titlebar, ActivityBar, etc.
			yield* _(workbenchLayout.createNotifications(instantiationService)); // For now, pass the legacy service
			yield* _(
				Effect.sync(() =>
					parentElement.appendChild(workbenchLayout.mainContainer),
				),
			);
		});

		// 6. Orchestrate the startup sequence declaratively.
		yield* _(Effect.log("Workbench services initialized."));
		yield* _(Effect.forkDaemon(registerListenersEffect)); // Run listeners in the background.
		yield* _(renderWorkbenchEffect);
		yield* _(Effect.sync(() => workbenchLayout.layout())); // Perform initial layout.

		// Restoration logic
		yield* _(workbenchLayout.restoreParts());
		yield* _(
			Effect.sync(
				() => (LifecycleService.phase = LifecyclePhase.Restored),
			),
		);
		yield* _(Effect.log("Workbench restored."));

		// Finally, return the constructed Workbench service.
		return workbenchLayout;
	}),
);

export default LiveWorkbench;
