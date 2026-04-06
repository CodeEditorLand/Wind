/**
 * @module Bootstrap/Types/VSCodeTypes
 * @description
 * VSCode-specific type definitions.
 * Re-exports from atomic VSCode type files.
 * Provides comprehensive type definitions for VSCode integration.
 */

// Main interfaces
export type { IVSCodeWorkbenchOptions } from "./VSCode/Interface/VSCodeWorkbenchOptions.js";
export type { IVSCodeServiceCollection } from "./VSCode/Interface/VSCodeServiceCollection.js";
export type { IVSCodeServiceIdentifier } from "./VSCode/Interface/VSCodeServiceIdentifier.js";
export type { IVSCodeEnvironmentService } from "./VSCode/Interface/VSCodeEnvironmentService.js";
export type {
	IVSCodeConfigurationService,
	Event as ConfigurationEvent,
	IDisposable as ConfigurationDisposable,
} from "./VSCode/Interface/VSCodeConfigurationService.js";
export type { IVSCodeLoggerService } from "./VSCode/Interface/VSCodeLoggerService.js";

// Configuration types
export type {
	ConfigurationTarget,
	IConfigurationChangeEvent,
	Event as ConfigEvent,
	IDisposable as ConfigDisposable,
} from "./VSCode/Type/VSCodeConfigurationType.js";

// Logger types
export type {
	LogLevel,
	ILogger,
	ILoggerOptions,
	Event as LoggerEvent,
	IDisposable as LoggerDisposable,
} from "./VSCode/Type/VSCodeLoggerType.js";

// Common types
export type {
	ExtensionId,
	MarketplaceExtension,
	ITunnelOptions,
	ITunnel,
} from "./VSCode/Type/VSCodeGenericType.js";

// Network types
export type {
	IWebSocketFactory,
	IWebSocket,
} from "./VSCode/Type/VSCodeNetworkType.js";

// Provider types
export type {
	IResourceUriProvider,
	IExternalUriResolver,
	IRemoteResourceProvider,
} from "./VSCode/Type/VSCodeProviderType.js";

// Utility types
export type { UriComponents, URI } from "./VSCode/Type/VSCodeUtilityType.js";

// Workbench options supporting types
export type {
	IAuthenticationProvider,
	ICommand,
	IDefaultLayout,
	ICommonTelemetryPropertiesResolver,
	IDevelopmentOptions,
	IInitialColorTheme,
	IProductConfiguration,
	IProductQualityChangeHandler,
	ISecretStorageProvider,
	ISettingsSyncOptions,
	IUpdateProvider,
	IUrlCallbackProvider,
	IWelcomeBanner,
	IWindowIndicator,
	IWorkspaceProvider,
	IWorkspace,
	IWorkspaceFolder,
	ITunnelProvider,
} from "./VSCode/Type/VSCodeWorkbenchOptionsType.js";
