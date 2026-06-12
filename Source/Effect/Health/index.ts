/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Plain async service replacing the former Effect-based monitoring.
 * @category Service
 */

// Types
export type {
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "./Type/HealthType.js";

// Interface
export type {
	HealthMonitorHandle,
	HealthService,
} from "./Interface/HealthService.js";

// Implementation helpers
export {
	CreateServiceHealth,
	CreateServiceHealthWithNoResponseTime,
} from "./Implementation/HealthHelper.js";

// Implementations
export {
	makeHealthChecker,
	makeMockHealth,
} from "./Implementation/HealthImplementation.js";

// Live and mock services
export {
	HealthLive,
	HealthMock,
} from "./Implementation/HealthImplementation.js";
