/*
 * File: Wind/Source/Application/Instantiation/Layer.ts
 * Role: Defines the master application layer (`AppLayer`).
 * Responsibilities:
 *   - Compose all individual live service implementations into a single dependency graph.
 *   - Use Effect-TS `Layer`s to manage the application's entire dependency injection container.
 *   - Tap into the fully-built context to run initialization logic for services that
 *     need to start listening to events upon application startup.
 */

import { Effect, Layer } from "effect";
import { ContextKeyService } from "vs/platform/contextkey/browser/contextKeyService.js";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import {
	IWorkspaceContextService,
	WorkspaceContextService,
} from "vs/platform/workspace/common/workspace.js";

// --- Import all available live service layers ---
import { Live as LiveClipboardService } from "../Clipboard/mod.js";
import {
	Configuration,
	Live as LiveConfigurationService,
} from "../Configuration/mod.js";
import { Live as LiveDialogService } from "../Dialog/mod.js";
import {
	DocumentManagementService,
	Live as LiveDocumentManagementService,
} from "../Document/mod.js";
import { Live as LiveEditorService } from "../Editor/mod.js";
import { Live as LiveEditorGroupService } from "../EditorGroups/mod.js";
import { Live as LiveEnvironmentService } from "../Environment/mod.js";
import { Live as LiveFileService } from "../File/mod.js";
import { Live as LiveHostService } from "../Host/mod.js";
import {
	LanguageFeaturesService,
	Live as LiveLanguageFeaturesService,
} from "../LanguageFeatures/mod.js";
import { Live as LiveLifecycleService } from "../Lifecycle/mod.js";
import { Live as LiveLogService } from "../Log/mod.js";
import { Live as LiveNotificationService } from "../Notification/mod.js";
import { Live as LivePaneCompositeService } from "../PaneComposite/mod.js";
import { Live as LiveQuickInputService } from "../QuickInput/mod.js";
import { Live as LiveSourceControlManagementService } from "../SourceControlManagement/mod.js";
import { Live as LiveStorageService } from "../Storage/mod.js";
import { Live as LiveTextEditorService } from "../TextEditor/mod.js";
import { Live as LiveTreeViewService } from "../TreeView/mod.js";
import { Live as LiveViewsService } from "../Views/mod.js";
import { Live as LiveWorkspaceService } from "../Workspaces/mod.js";
import { Live as LiveWorkspaceTrustService } from "../Workspaces/Trust/mod.js";

/**
 * An `Effect` that dynamically constructs the master application `Layer`.
 * This allows us to potentially use feature flags from the configuration service
 * to include or exclude certain service implementations.
 */
const DynamicLiveLayerEffect = Effect.gen(function* (_) {
	const ConfigurationService = yield* _(Configuration.Tag);

	// Example: Define which features are enabled based on configuration values.
	const Feature = {
		SourceControlManagement: ConfigurationService.getValue<boolean>("feature.scm.enable", true),
		Test: ConfigurationService.getValue<boolean>(
			"feature.test.enable",
			true,
		),
	};

	// Start with a list of core services that are always included.
	const CoreLayers = [
		LiveClipboardService,
		LiveDialogService,
		LiveDocumentManagementService,
		LiveEditorService,
		LiveEditorGroupService,
		LiveEnvironmentService,
		LiveFileService,
		LiveHostService,
		LiveLanguageFeaturesService,
		LiveLifecycleService,
		LiveLogService,
		LiveNotificationService,
		LivePaneCompositeService,
		LiveQuickInputService,
		LiveStorageService,
		LiveTextEditorService,
		LiveTreeViewService,
		LiveViewsService,
		LiveWorkspaceService,
		LiveWorkspaceTrustService,
	];

	// Conditionally add layers for enabled features.
	if (Feature.SourceControlManagement) {
		// SourceControlManagement has a few extra dependencies we need to provide stub implementations for.
		const SourceControlManagementDependencies = Layer.mergeAll(
			Layer.succeed(
				IContextKeyService,
				new ContextKeyService(yield* _(Configuration.Tag)),
			),
			Layer.succeed(
				IWorkspaceContextService,
				new WorkspaceContextService({ id: "" }),
			),
		);
		const SourceControlManagementFeatureLayer = LiveSourceControlManagementService.pipe(
			Layer.provide(SourceControlManagementDependencies),
		);
		CoreLayers.push(SourceControlManagementFeatureLayer);
	}
	if (Feature.Test) {
		// Future: CoreLayers.push(LiveTestService);
	}

	// Merge all selected layers into a single, powerful application layer.
	return Layer.mergeAll(...CoreLayers);
});

/**
 * The final, composed application `Layer` for the `Wind` workbench.
 *
 * It uses `Layer.unwrapEffect` to handle the dynamic composition. This pattern
 * ensures that the `ConfigurationService` is available *before* the rest of
 * the layers are composed, allowing the final dependency graph to be configured
 * at runtime.
 */
export const AppLayer = Layer.unwrapEffect(
	// The `DynamicLiveLayerEffect` itself needs the `ConfigurationService`,
	// so we provide its live layer to the effect.
	Effect.provide(DynamicLiveLayerEffect, LiveConfigurationService),
).pipe(
	// Tap into the fully-formed context after the layer is built to run any
	// necessary initialization logic.
	Layer.tap((context) =>
		Effect.all(
			[
				context.get(DocumentManagementService.Tag).Initialize(),
				context.get(LanguageFeaturesService.Tag).Initialize(),
			],
			{ discard: true },
		),
	),
);
