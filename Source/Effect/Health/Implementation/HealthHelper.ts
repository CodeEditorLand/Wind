/**
 * @module Effect/Health/Implementation/HealthHelper
 * @description
 * Helper functions for creating service health instances.
 * @category Implementation
 */

import type { ServiceHealth, HealthStatus } from "../Type/HealthType.js";

export const createServiceHealth = (
	name: string,
	status: HealthStatus,
	message: string,
	responseTime: number,
	details?: Readonly<Record<string, unknown>>,
) => ({
	serviceName: name,
	status,
	message,
	lastChecked: Date.now(),
	responseTime,
	...((details !== undefined) ? { details } : {}),
}) satisfies ServiceHealth;

export const createServiceHealthWithNoResponseTime = (
	name: string,
	status: HealthStatus,
	message: string,
) => ({
	serviceName: name,
	status,
	message,
	lastChecked: Date.now(),
	responseTime: 0,
}) satisfies ServiceHealth;

export default { createServiceHealth, createServiceHealthWithNoResponseTime };
