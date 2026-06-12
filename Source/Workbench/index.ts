/**
 * @module Workbench
 * @description
 * VSCode browser workbench integration layer for Wind.
 * Integrates Mountain's file system provider with VSCode's browser workbench.
 * @category Service
 */

// ============================================================================
// Service
// ============================================================================

export {
	default,
	WorkbenchIntegration,
} from "./Implementation/WorkbenchIntegrationImplementation.js";

// ============================================================================
// Interface
// ============================================================================

export type { WorkbenchIntegrationService } from "./Interface/WorkbenchIntegrationService.js";

// ============================================================================
// Types
// ============================================================================

export type {
	ProviderRegistrationResult,
	WorkbenchDiagnostics,
	WorkbenchInitState,
	WorkbenchIntegrationConfig,
	WorkbenchIntegrationError,
	WorkbenchState,
	WorkspaceContext,
} from "./Type/WorkbenchIntegrationType.js";

export { WorkbenchIntegrationErrorCode } from "./Type/WorkbenchIntegrationType.js";
