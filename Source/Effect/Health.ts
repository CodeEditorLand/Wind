// Import and re-export the plain services
import {
	HealthLive as LiveService,
	HealthMock as MockService,
} from "./Health/Implementation/HealthImplementation.js";

/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Types
export type {
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "./Health/index.js";

// Interface
export type {
	HealthMonitorHandle,
	HealthService,
} from "./Health/Interface/HealthService.js";

// Implementation helpers
export {
	CreateServiceHealth,
	CreateServiceHealthWithNoResponseTime,
} from "./Health/index.js";

export { LiveService, MockService };

// Backward compatibility aliases
export const HealthLive = LiveService;

export const HealthMock = MockService;
