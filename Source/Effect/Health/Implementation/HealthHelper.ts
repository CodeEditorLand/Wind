/**
 * @module Effect/Health/Implementation/HealthHelper
 * @description
 * Helper functions for creating service health instances.
 * @category Implementation
 */

import type { HealthStatus, ServiceHealth } from "../Type/HealthType.js";

export const CreateServiceHealth = (
	Name: string,

	Status: HealthStatus,

	Message: string,

	ResponseTime: number,

	Details?: Readonly<Record<string, unknown>>,
): ServiceHealth =>
	({
		serviceName: Name,
		status: Status,
		message: Message,
		lastChecked: Date.now(),
		responseTime: ResponseTime,
		...(Details !== undefined ? { details: Details } : {}),
	}) satisfies ServiceHealth;

export const CreateServiceHealthWithNoResponseTime = (
	Name: string,

	Status: HealthStatus,

	Message: string,
): ServiceHealth =>
	({
		serviceName: Name,
		status: Status,
		message: Message,
		lastChecked: Date.now(),
		responseTime: 0,
	}) satisfies ServiceHealth;

export default { CreateServiceHealth, CreateServiceHealthWithNoResponseTime };
