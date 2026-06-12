/**
 * @module Effect/Health/Implementation/HealthImplementation
 * @description
 * Main implementation of the Health monitoring service.
 * Plain async service: checks run with Promise.all, periodic monitoring
 * uses setInterval behind a disposable handle.
 * @category Implementation
 */

import { ConfigurationLive } from "../../Configuration.js";
import {
	DetectArchitecture,
	DetectPlatform,
} from "../../Environment/Implementation/EnvironmentHelper.js";
import { MountainLive } from "../../Mountain.js";
import type {
	HealthMonitorHandle,
	HealthService,
} from "../Interface/HealthService.js";
import type {
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "../Type/HealthType.js";

export const makeHealthChecker = (): HealthService => {
	const checkService = async (
		ServiceName: string,
	): Promise<ServiceHealth> => {
		const StartTime = Date.now();

		switch (ServiceName.toLowerCase()) {
			case "environment":
				return {
					serviceName: "Environment",

					status: "healthy",

					message: "Environment service available",

					lastChecked: Date.now(),

					responseTime: Date.now() - StartTime,
				} satisfies ServiceHealth;

			case "telemetry":
				return {
					serviceName: "Telemetry",

					status: "healthy",

					message: "Telemetry service available",

					lastChecked: Date.now(),

					responseTime: Date.now() - StartTime,
				} satisfies ServiceHealth;

			case "mountain": {
				try {
					const Version = await MountainLive.version();

					return {
						serviceName: "Mountain",

						status: "healthy",

						message: `Mountain backend connected (v${Version})`,

						lastChecked: Date.now(),

						responseTime: Date.now() - StartTime,

						details: { version: Version } as const,
					} satisfies ServiceHealth;
				} catch (CheckError) {
					return {
						serviceName: "Mountain",

						status: "unhealthy",

						message: `Mountain connection failed: ${String(CheckError)}`,

						lastChecked: Date.now(),

						responseTime: Date.now() - StartTime,
					} satisfies ServiceHealth;
				}
			}

			case "ipc":
				return {
					serviceName: "IPC",

					status: "healthy",

					message: "IPC service available",

					lastChecked: Date.now(),

					responseTime: Date.now() - StartTime,
				} satisfies ServiceHealth;

			case "configuration": {
				try {
					ConfigurationLive.get();

					return {
						serviceName: "Configuration",

						status: "healthy",

						message: "Configuration service available",

						lastChecked: Date.now(),

						responseTime: Date.now() - StartTime,
					} satisfies ServiceHealth;
				} catch {
					return {
						serviceName: "Configuration",

						status: "unhealthy",

						message: "Configuration service error",

						lastChecked: Date.now(),

						responseTime: Date.now() - StartTime,
					} satisfies ServiceHealth;
				}
			}

			default:
				return {
					serviceName: ServiceName,

					status: "unknown",

					message: `Unknown service: ${ServiceName}`,

					lastChecked: Date.now(),

					responseTime: 0,
				} satisfies ServiceHealth;
		}
	};

	const checkAllServices = async (): Promise<SystemHealth> => {
		const Services = [
			"environment",

			"telemetry",

			"mountain",

			"ipc",

			"configuration",
		] as const;

		const HealthResults = await Promise.all(
			Services.map((Service) => checkService(Service)),
		);

		const UnhealthyCount = HealthResults.filter(
			(Health: ServiceHealth) => Health.status === "unhealthy",
		).length;

		const DegradedCount = HealthResults.filter(
			(Health: ServiceHealth) => Health.status === "degraded",
		).length;

		let OverallStatus: HealthStatus = "healthy";

		if (UnhealthyCount > 0) {
			OverallStatus = "unhealthy";
		} else if (DegradedCount > 0) {
			OverallStatus = "degraded";
		}

		return {
			overallStatus: OverallStatus,

			services: HealthResults,

			systemInfo: {
				platform: DetectPlatform(),

				architecture: DetectArchitecture(),

				upSince: Date.now(),
			},

			lastChecked: Date.now(),
		} satisfies SystemHealth;
	};

	const getOverallStatus = async (): Promise<HealthStatus> =>
		(await checkAllServices()).overallStatus;

	const monitorService = (
		ServiceName: string,

		IntervalMs: number,
	): HealthMonitorHandle => {
		const Handle = setInterval(() => {
			void checkService(ServiceName);
		}, IntervalMs);

		return {
			dispose: (): void => {
				clearInterval(Handle);
			},
		};
	};

	return {
		checkService,

		checkAllServices,

		getOverallStatus,

		monitorService,
	};
};

export const HealthLive: HealthService = makeHealthChecker();

export const makeMockHealth = (
	Overrides?: Partial<Record<string, HealthStatus>>,
): HealthService => ({
	checkService: async (ServiceName: string) => {
		const DefaultStatus: HealthStatus = "healthy";

		const Status = Overrides?.[ServiceName] ?? DefaultStatus;

		return {
			serviceName: ServiceName,
			status: Status,
			message:
				Status === "healthy"
					? "Mock service healthy"
					: "Mock service unhealthy",
			lastChecked: Date.now(),
			responseTime: 0,
		} satisfies ServiceHealth;
	},

	checkAllServices: async () => {
		const Services = [
			"environment",
			"telemetry",
			"mountain",
			"ipc",
			"configuration",
		];

		const Results = Services.map(
			(Name) =>
				({
					serviceName: Name,
					status: Overrides?.[Name] ?? "healthy",
					message: "Mock service check",
					lastChecked: Date.now(),
					responseTime: 0,
				}) satisfies ServiceHealth,
		);

		return {
			overallStatus: "healthy" as const,
			services: Results,
			systemInfo: {
				platform: "mock",
				architecture: "mock",
				upSince: Date.now(),
			},
			lastChecked: Date.now(),
		} satisfies SystemHealth;
	},

	getOverallStatus: async () => "healthy" as const,

	monitorService: () => ({ dispose: (): void => {} }),
});

export const HealthMock: HealthService = makeMockHealth();
