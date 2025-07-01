/**
 * @module Layer (Application)
 * @description Defines the master application layer for the Wind workbench.
 * This layer is responsible for composing all individual live service
 * implementations into a single, cohesive, and fully-resolved dependency graph.
 * It serves as the complete dependency injection container for the application.
 */
import { Layer } from "effect";

/**
 * The master `AppLayer` for the Wind application.
 *
 * This layer composes all the live implementations of the application's
 * services into a single, injectable unit. By providing this layer to our main
 * application `Effect`, we satisfy all of its dependencies at once.
 *
 * It starts with the lowest-level integration layer and builds upon it.
 */
export declare const AppLayer: Layer.Layer<
	| import("./Host/Service.js").HostService
	| import("./Clipboard/Service.js").Clipboard
	| import("./Logger/Service.js").LoggerService
	| import("./WorkSpace/Service.js").WorkSpaceService
	| import("./Window/Service.js").WindowService
	| import("./Command/Service.js").CommandService
	| import("./Configuration/Service.js").Configuration
	| import("./Dialog/Service.js").DialogService
	| import("./Document/Service.js").DocumentService
	| import("./TextEditor/Service.js").TextEditorService
	| import("./Editor/Service.js").EditorService
	| import("./EditorGroup/Service.js").EditorGroupService
	| import("./FileSystem/Service.js").FileSystemService
	| import("./File/Service.js").FileService
	| import("./LanguageFeature/Service.js").LanguageFeatureService
	| import("./Marker/Service.js").MarkerService
	| import("./Notification/Service.js").NotificationService
	| import("./QuickInput/Service.js").QuickInputService
	| import("./SourceControlManagement/Service.js").SourceControlManagementService
	| import("./StatusBar/Service.js").StatusBarService
	| import("./Storage/Service.js").StorageService
	| import("./TreeView/Service.js").TreeViewService
	| import("./WebViewPanel/Service.js").WebViewPanelService,
	never,
	any
>;
/**
 * A type alias representing the fully-resolved context provided by the `AppLayer`.
 * This can be useful for functions or tests that need to know the complete set
 * of available services.
 */
export type AppContext = Layer.Layer.Context<typeof AppLayer>;
