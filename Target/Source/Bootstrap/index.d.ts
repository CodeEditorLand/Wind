/**
 * @module Bootstrap
 * @description
 * Atomic bootstrap system for VSCode workbench initialization.
 * Provides highly debuggable, defensive bootstrapping with maximum atomicity.
 */
export { bootstrap, BootstrapOrchestrator, } from "./Core/BootstrapOrchestrator.js";
export { EnvironmentStage } from "./Stages/Stage0-Environment.js";
export { PreloadStage } from "./Stages/Stage1-Preload.js";
export { ConfigurationStage } from "./Stages/Stage2-Configuration.js";
export { ServicesStage } from "./Stages/Stage3-Services.js";
export { PreparationStage } from "./Stages/Stage4-Preparation.js";
export { InitializationStage } from "./Stages/Stage5-Initialization.js";
export { HealthCheckStage } from "./Stages/Stage6-HealthCheck.js";
export { StatusReporter } from "./Core/StatusReporter.js";
export { ErrorHandler } from "./Core/ErrorHandler.js";
export type { Platform, Mode, StageName, ErrorSeverity, StageResult, BootstrapResult, BootstrapConfig, StatusUpdate, EnvironmentData, ConfigurationData, ServiceData, WorkbenchData, } from "./Types/BootstrapTypes.js";
//# sourceMappingURL=index.d.ts.map