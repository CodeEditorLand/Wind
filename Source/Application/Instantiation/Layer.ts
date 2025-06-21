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

// TODO: Import all available live service layers

// TODO: Placeholders for future, feature-flagged services

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
