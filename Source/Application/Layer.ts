/**
 * @module Layer (Application)
 * @description Defines the master application layer for the Wind workbench.
 * This layer is responsible for composing all individual live service
 * implementations into a single, cohesive, and fully-resolved dependency graph.
 * It serves as the complete dependency injection container for the application.
 */

import { Layer } from "effect";

// Import all live service layers that will be part of the application.
import { ClipboardLive } from "./Clipboard/Live.js";
import { ConfigurationLive } from "./Configuration/Live.js";
import { DialogLive } from "./Dialog/Live.js";
import { DocumentLive } from "./Document/Live.js";
import { EditorLive } from "./Editor/Live.js";
import { EditorGroupsLive } from "./EditorGroups/Live.js";
import { FileLive } from "./File/Live.js";
import { FileSystemProviderLive } from "./FileSystem/Live.js";
import { HostLive } from "./Host/Live.js";
import { LanguageFeatureLive } from "./LanguageFeature/Live.js";
import { LogLive } from "./Log/Live.js";
import { MarkerLive } from "./Marker/Live.js";
import { QuickInputLive } from "./QuickInput/Live.js";
import { SourceControlManagementLive } from "./SourceControlManagement/Live.js";
import { StorageLive } from "./Storage/Live.js";
import { TextEditorLive } from "./TextEditor/Live.js";
import { TreeViewLive } from "./TreeView/Live.js";

// Import integration layers
import { IntegrationLive } from "Source/Integration/Tauri/Live.js";

/**
 * The master `AppLayer` for the Wind application.
 *
 * This layer composes all the live implementations of the application's
 * services into a single, injectable unit. By providing this layer to our main
 * application `Effect`, we satisfy all of its dependencies at once.
 *
 * It starts with the lowest-level integration layer and builds upon it.
 */
export const AppLayer = Layer.mergeAll(
	ClipboardLive,
	ConfigurationLive,
	DialogLive,
	DocumentLive,
	EditorLive,
	EditorGroupsLive,
	FileLive,
	FileSystemProviderLive,
	HostLive,
	LanguageFeatureLive,
	LogLive,
	MarkerLive,
	QuickInputLive,
	SourceControlManagementLive,
	StorageLive,
	TextEditorLive,
	TreeViewLive,
).pipe(Layer.provide(IntegrationLive)); // Provide the integration layer to all services that need it.

/**
 * A type alias representing the fully-resolved context provided by the `AppLayer`.
 * This can be useful for functions or tests that need to know the complete set
 * of available services.
 */
export type AppContext = Layer.Layer.Context<typeof AppLayer>;
