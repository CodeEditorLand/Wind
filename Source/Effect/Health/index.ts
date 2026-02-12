/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 * @category Service
 */

// Types
export type { HealthStatus, ServiceHealth, SystemHealth } from "./Type/HealthType.js";

// Interface
export type { HealthService } from "./Interface/HealthService.js";

// Tag
export { HealthTag } from "./Tag/HealthTag.js";

// Implementation helpers
export { CreateServiceHealth, CreateServiceHealthWithNoResponseTime } from "./Implementation/HealthHelper.js";

// Implementations
export { makeHealthChecker, makeMockHealth } from "./Implementation/HealthImplementation.js";

// Layers
export { HealthLive, HealthMock } from "./Implementation/HealthImplementation.js";
