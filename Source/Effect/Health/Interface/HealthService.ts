/**
 * @module Effect/Health/Interface/HealthService
 * @description
 * Service interface for health monitoring operations.
 * @category Interface
 */

import type {
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "../Type/HealthType.js";

export interface HealthMonitorHandle {
	readonly dispose: () => void;
}

export interface HealthService {
	readonly checkService: (serviceName: string) => Promise<ServiceHealth>;

	readonly checkAllServices: () => Promise<SystemHealth>;

	readonly getOverallStatus: () => Promise<HealthStatus>;

	readonly monitorService: (
		serviceName: string,

		intervalMs: number,
	) => HealthMonitorHandle;
}
