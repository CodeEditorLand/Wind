/**
 * @module Bootstrap/Types
 * @description
 * Type definitions for the bootstrap system.
 */

export type {
	Platform,
	Mode,
	StageName,
	ErrorSeverity,
	StageResult,
	BootstrapResult,
	BootstrapConfig,
	StatusUpdate,
	EnvironmentData,
	ConfigurationData,
	ServiceData,
	WorkbenchData,
} from "./BootstrapTypes.js";

export type {
	IVSCodeWorkbenchOptions,
	IVSCodeServiceCollection,
	IVSCodeServiceIdentifier,
	IVSCodeEnvironmentService,
	IVSCodeConfigurationService,
	IVSCodeLoggerService,
} from "./VSCodeTypes.js";
