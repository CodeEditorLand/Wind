/*
 * File: Wind/Source/Application/DesktopMain.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ./Instantiation/Layer.js, ./Workbench/Live.js, effect, vs/base/browser/dom.js
 */

// Source/Application/DesktopMain.ts
import { Effect, Layer } from "effect";
import { domContentLoaded } from "vs/base/browser/dom.js";

import { AppLayer } from "./Instantiation/Layer.js"; // The grand composition of all services
import LiveWorkbench from "./Workbench/Live.js";

// The entire application startup, described as a single value.
const MainEffect = Effect.gen(function* (_) {
	// The AppLayer provides all the low-level native/Tauri services.
	// The WorkbenchLayer provides the UI orchestration logic.
	const MainLayer = Layer.provide(LiveWorkbench, AppLayer);

	// We launch the layer. This builds the entire dependency graph,
	// runs all the startup logic from the Workbench layer, and keeps it
	// running until the scope is closed (i.e., the window is closed).
	yield* _(Layer.launch(MainLayer));

	// We can also add effects to run after startup.
	yield* _(Effect.log("Wind Workbench successfully launched."));
});

// The final execution step.
Effect.runFork(
	Effect.promise(() => domContentLoaded(window)).pipe(
		Effect.andThen(MainEffect),
	),
);
