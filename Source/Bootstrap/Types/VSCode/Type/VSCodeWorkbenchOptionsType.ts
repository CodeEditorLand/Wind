/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeWorkbenchOptionsType
 * @description
 * Supporting types for VSCode Workbench Construction Options.
 * All types are re-exported from their authoritative VS Code source locations
 * in @codeeditorland/output - no local re-declarations.
 */

// Types directly exported by web.api.d.ts
export type {
	ICommand,
	IDefaultLayout,
	ICommonTelemetryPropertiesResolver,
	IDevelopmentOptions,
	IInitialColorTheme,
	IProductQualityChangeHandler,
	ISettingsSyncOptions,
	IWelcomeBanner,
	IWindowIndicator,
	IWorkspaceProvider,
	ITunnelProvider,
	ITunnelOptions,
	ITunnel,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/browser/web.api.js";

// Types sourced from VS Code sub-packages
export type { IAuthenticationProvider } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/authentication/common/authentication.js";

export type { IProductConfiguration } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/product.js";

export type { ISecretStorageProvider } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/secrets/common/secrets.js";

export type { IUpdateProvider } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/update/browser/updateService.js";

export type { IURLCallbackProvider as IUrlCallbackProvider } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/url/browser/urlService.js";

// IWorkspace / IWorkspaceFolder - VS Code uses IWorkspaceToOpen | IFolderToOpen | undefined.
// Re-export the canonical types; Wind consumers should use IWorkspaceToOpen / IFolderToOpen directly.
export type {
	IWorkspaceToOpen,
	IFolderToOpen,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/window/common/window.js";
