/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Types
export type { HealthStatus, ServiceHealth, SystemHealth } from "./Health/index.js";

// Interface
export type { HealthService } from "./Health/Interface/HealthService.js";

// Tag
export { HealthTag } from "./Health/index.js";

// Implementation helpers
export {
	createServiceHealth,
	createServiceHealthWithNoResponseTime,
} from "./Health/index.js";

// Import and re-export layers
import { HealthLive as LiveLayer, HealthMock as MockLayer } from "./Health/Implementation/HealthImplementation.js";
export { LiveLayer, MockLayer };

// Backward compatibility aliases
export const HealthLive = LiveLayer;
export const HealthMock = MockLayer;
