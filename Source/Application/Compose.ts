/**
 * @module Compose
 * @description
 * This module defines the master application layer for the Wind workbench.
 * This layer is responsible for composing all individual live service
 * implementations into a single, cohesive, and fully-resolved dependency graph.
 * It serves as the complete dependency injection container for the application.
 */

import { IContextKeyService } from "@codeeditorland/output/vs/platform/contextkey/common/contextkey.js";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { IFilesConfigurationService } from "@codeeditorland/output/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import { IRemoteAgentService } from "@codeeditorland/output/vs/workbench/services/remote/common/remoteAgentService.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import {
	IUserDataProfileService,
	IUserDataProfilesService,
} from "@codeeditorland/output/vs/workbench/services/userDataProfile/common/userDataProfile.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyFileService.js";
// Import layers for placeholder services
import { Layer, Layer as PlaceholderLayer } from "effect";

// Import all live service layers that will be part of the application.
import { ProvideClipboard } from "./Clipboard/Implement.js";
import { ProvideCommand } from "./Command/Implement.js";
import { ProvideConfiguration } from "./Configuration/Implement.js";
import { ProvideDebug } from "./Debug/Implement.js";
import { ProvideDialog } from "./Dialog/Implement.js";
import { ProvideDocument } from "./Document/Implement.js";
import { ProvideEditor } from "./Editor/Implement.js";
import { ProvideEditorGroup } from "./EditorGroup/Implement.js";
import { ProvideFile } from "./File/Implement.js";
import { ProvideFileSystem } from "./FileSystem/Implement.js";
import { ProvideHost } from "./Host/Implement.js";
import { ProvideIntegration } from "./Integration/Implement.js";
import { ProvideIPC } from "./IPC/Implement.js";
import { ProvideLogger } from "./Logger/Implement.js";
import { ProvideNotification } from "./Notification/Implement.js";
import { ProvideQuickInput } from "./QuickInput/Implement.js";
import { ProvideSourceControlManagement } from "./SourceControlManagement/Implement.js";
import { ProvideStatusBar } from "./StatusBar/Implement.js";
import { ProvideStorage } from "./Storage/Implement.js";
import { ProvideTextEditor } from "./TextEditor/Implement.js";
import { ProvideTreeView } from "./TreeView/Implement.js";
import { ProvideWebViewPanel } from "./WebViewPanel/Implement.js";
import { ProvideWindow } from "./Window/Implement.js";
import { ProvideWorkSpace } from "./WorkSpace/Implement.js";

const ProvidePlaceholders = Layer.mergeAll(
	PlaceholderLayer.succeed(IContextKeyService, {} as any),
	PlaceholderLayer.succeed(IBrowserWorkbenchEnvironmentService, {} as any),
	PlaceholderLayer.succeed(IFileService, {} as any),
	PlaceholderLayer.succeed(IInstantiationService, {
		createInstance: (ctor: any, ...args: any[]) => new ctor(...args),
	} as any),
	PlaceholderLayer.succeed(IPolicyService, {} as any),
	PlaceholderLayer.succeed(IRemoteAgentService, {} as any),
	PlaceholderLayer.succeed(IUriIdentityService, {} as any),
	PlaceholderLayer.succeed(IUserDataProfileService, {} as any),
	PlaceholderLayer.succeed(IUserDataProfilesService, {} as any),
	PlaceholderLayer.succeed(IUntitledTextEditorService, {} as any),
	PlaceholderLayer.succeed(IViewsService, {} as any),
	PlaceholderLayer.succeed(ILifecycleService, {} as any),
	PlaceholderLayer.succeed(IFilesConfigurationService, {} as any),
	PlaceholderLayer.succeed(IWorkingCopyFileService, {} as any),
);

/**
 * The master `ApplicationLayer` for the Wind application.
 *
 * This layer composes all the live implementations of the application's
 * services into a single, injectable unit. By providing this layer to our main
 * application `Effect`, we satisfy all of its dependencies at once.
 *
 * It starts with the lowest-level integration layer and builds upon it, finally
 * merging in all application-level services.
 */
export const ApplicationLayer = Layer.mergeAll(
	ProvideClipboard,
	ProvideCommand,
	ProvideConfiguration,
	ProvideDebug,
	ProvideDialog,
	ProvideDocument,
	ProvideEditor,
	ProvideEditorGroup,
	ProvideFile,
	ProvideFileSystem,
	ProvideHost,
	ProvideIPC,
	ProvideLogger,
	ProvideNotification,
	ProvideQuickInput,
	ProvideSourceControlManagement,
	ProvideStatusBar,
	ProvideStorage,
	ProvideTextEditor,
	ProvideTreeView,
	ProvideWebViewPanel,
	ProvideWindow,
	ProvideWorkSpace,
).pipe(
	Layer.provide(ProvideIntegration),
	Layer.provide(ProvidePlaceholders), // Provide placeholders for services not yet implemented
);
