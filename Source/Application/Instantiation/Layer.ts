

/**
 * @module Layer (Instantiation)
 * @description Defines the master application layer (`Live`).
 *
 * This file composes all individual live service implementations into a single,
 * self-contained dependency graph for the entire `Wind` application. It also
 * demonstrates a powerful pattern of conditional layer composition based on
 * feature flags retrieved from the `ConfigurationService`, allowing for
 * different "editions" of the application to be built from the same codebase.
 */

import { Effect, Layer } from "effect";

// --- Import all available live service layers ---
import { Live as LiveClipboardService } from "../Clipboard/mod.js";
import {
	Configuration,
	Live as LiveConfigurationService,
} from "../Configuration/mod.js";
import { Live as LiveDialogService } from "../Dialog/mod.js";
import { Live as LiveEditorService } from "../Editor/mod.js";
import { Live as LiveEditorGroupService } from "../EditorGroups/mod.js";
import { Live as LiveEnvironmentService } from "../Environment/mod.js";
import { Live as LiveFileService } from "../File/mod.js";
import { Live as LiveHostService } from "../Host/mod.js";
import { Live as LiveLifecycleService } from "../Lifecycle/mod.js";
import { Live as LiveLogService } from "../Log/mod.js";
import { Live as LiveNotificationService } from "../Notification/mod.js";
import { Live as LivePaneCompositeService } from "../PaneComposite/mod.js";
import { Live as LiveQuickInputService } from "../QuickInput/mod.js";
import { Live as LiveStorageService } from "../Storage/mod.js";
import { Live as LiveTextEditorService } from "../TextEditor/mod.js";
import { Live as LiveViewService } from "../Views/mod.js";
import { Live as LiveWorkspaceService } from "../Workspaces/mod.js";
import { Live as LiveWorkspaceTrustService } from "../Workspaces/Trust/mod.js";

// --- Placeholders for future, feature-flagged services ---
// import { Live as LiveScmService } from "../Scm/mod.js";
// import { Live as LiveTestService } from "../Testing/mod.js";

/**
 * An `Effect` that dynamically constructs the master application `Layer`.
 *
 * It resolves the `ConfigurationService` first to read feature flags,
 * then composes the final layer based on that configuration.
 */
const DynamicLiveLayerEffect = Effect.gen(function* (_) {
	const ConfigurationService = yield* _(Configuration.Tag);

	// Define which features are enabled based on configuration values.
	const Feature = {
		Scm: ConfigurationService.getValue<boolean>("feature.scm.enable", true),
		Test: ConfigurationService.getValue<boolean>(
			"feature.test.enable",
			true,
		),
	};

	// Start with a list of core services that are always included.
	const CoreLayer = [
		LiveClipboardService,
		LiveDialogService,
		LiveEditorService,
		LiveEditorGroupService,
		LiveEnvironmentService,
		LiveFileService,
		LiveHostService,
		LiveLifecycleService,
		LiveLogService,
		LiveNotificationService,
		LivePaneCompositeService,
		LiveQuickInputService,
		LiveStorageService,
		LiveTextEditorService,
		LiveViewService,
		LiveWorkspaceService,
		LiveWorkspaceTrustService,
	];

	// Conditionally add layers for enabled features.
	if (Feature.Scm) {
		// CoreLayer.push(LiveScmService);
	}
	if (Feature.Test) {
		// CoreLayer.push(LiveTestService);
	}

	// Merge all selected layers into a single, powerful application layer.
	return Layer.mergeAll(...CoreLayer);
});

/**
 * The final, composed application `Layer` for the `Wind` workbench.
 *
 * It uses `Layer.unwrapEffect` to handle the dynamic composition. This pattern
 * ensures that the `ConfigurationService` is available *before* the rest of
 * the layers are composed, allowing the final dependency graph to be configured
 * at runtime.
 */
export const Live = Layer.unwrapEffect(
	// The `DynamicLiveLayerEffect` itself needs the `ConfigurationService`,
	// so we provide its live layer to the effect.
	Effect.provide(DynamicLiveLayerEffect, LiveConfigurationService),
);
