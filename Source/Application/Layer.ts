/**
 * @module Layer (Application)
 * @description Defines the master application layer for the Wind workbench.
 * This layer is responsible for composing all individual live service
 * implementations into a single, cohesive, and fully-resolved dependency graph.
 * It serves as the complete dependency injection container for the application.
 */

import { Layer } from "effect";

// Import integration layers
import { IntegrationLive } from "../Integration/Tauri/Live.js";
// Import all live service layers that will be part of the application.
import { ClipboardLive } from "./Clipboard/Live.js";
import { CommandLive } from "./Command/Live.js";
import { ConfigurationLive } from "./Configuration/Live.js";
import { DialogLive } from "./Dialog/Live.js";
import { DocumentLive } from "./Document/Live.js";
import { EditorLive } from "./Editor/Live.js";
import { EditorGroupLive } from "./EditorGroup/Live.js";
import { FileLive } from "./File/Live.js";
import { FileSystemLive } from "./FileSystem/Implement.js";
import { HostLive } from "./Host/Live.js";
import { LanguageFeatureLive } from "./LanguageFeature/Live.js";
import { LoggerLive } from "./Logger/Live.js";
import { MarkerLive } from "./Marker/Live.js";
import { NotificationLive } from "./Notification/Implement.js";
import { QuickInputLive } from "./QuickInput/Implement.js";
import { SourceControlManagementLive } from "./SourceControlManagement/Implement.js";
import { StatusBarLive } from "./StatusBar/Implement.js";
import { StorageLive } from "./Storage/Implement.js";
import { TextEditorLive } from "./TextEditor/Live.js";
import { TreeViewLive } from "./TreeView/Implement.js";
import { WebViewPanelLive } from "./WebViewPanel/Implement.js";
import { WindowLive } from "./Window/Implement.js";
import { WorkSpaceLive } from "./WorkSpace/Live.js";

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
	CommandLive,
	ConfigurationLive,
	DialogLive,
	DocumentLive,
	EditorLive,
	EditorGroupLive,
	FileLive,
	FileSystemLive,
	HostLive,
	LanguageFeatureLive,
	LoggerLive,
	MarkerLive,
	NotificationLive,
	QuickInputLive,
	SourceControlManagementLive,
	StatusBarLive,
	StorageLive,
	TextEditorLive,
	TreeViewLive,
	WebViewPanelLive,
	WindowLive,
	WorkSpaceLive,
).pipe(Layer.provide(IntegrationLive)); // Provide the integration layer to all services that need it.

/**
 * A type alias representing the fully-resolved context provided by the `AppLayer`.
 * This can be useful for functions or tests that need to know the complete set
 * of available services.
 */
export type AppContext = Layer.Layer.Context<typeof AppLayer>;
