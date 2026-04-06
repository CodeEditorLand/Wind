/**
 * @module Workbench
 * @description
 * VSCode browser workbench integration layer for Wind.
 * Integrates Mountain's file system provider with VSCode's browser workbench.
 * @category Service
 */

// ============================================================================
// Tags
// ============================================================================

export {
	WorkbenchIntegrationTag,
	WorkbenchIntegrationLiveLayer,
	default,
} from "./Implementation/WorkbenchIntegrationImplementation.js";

// ============================================================================
// Interface
// ============================================================================

export type { WorkbenchIntegrationService } from "./Interface/WorkbenchIntegrationService.js";

// ============================================================================
// Types
// ============================================================================

export type {
	WorkbenchState,
	WorkbenchInitState,
	WorkbenchIntegrationConfig,
	ProviderRegistrationResult,
	WorkspaceContext,
	WorkbenchDiagnostics,
	WorkbenchIntegrationError,
} from "./Type/WorkbenchIntegrationType.js";

export { WorkbenchIntegrationErrorCode } from "./Type/WorkbenchIntegrationType.js";
