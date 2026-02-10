/**
 * @module Effect/Health/Implementation/HealthImplementation
 * @description
 * Main implementation of the Health monitoring service.
 * @category Implementation
 */

import { Effect, Layer, Schedule } from "effect";
import { EnvironmentTag } from "../../Environment.js";
import { TelemetryTag } from "../../Telemetry.js";
import { MountainTag } from "../../Mountain.js";
import { ConfigurationTag } from "../../Configuration.js";
import { HealthTag } from "../Tag/HealthTag.js";
import type { HealthService, ServiceHealth, SystemHealth, HealthStatus } from "../Type/HealthType.js";

export const makeHealthChecker = (): HealthService => ({
	checkService: (serviceName: string) =>
		Effect.gen(function* () {
			const startTime = Date.now();

			switch (serviceName.toLowerCase()) {
				case "environment":
					const envTime = Date.now() - startTime;
					return Effect.succeed({
						serviceName: "Environment",
						status: "healthy" as const,
						message: "Environment service available",
						lastChecked: Date.now(),
						responseTime: envTime,
					} satisfies ServiceHealth);

				case "telemetry":
					const telemetryService = yield* TelemetryTag;
					const telemetryTime = Date.now() - startTime;
					return yield* telemetryService.log("info", "[Health] Telemetry health check").pipe(
						Effect.map(() =>
							({
								serviceName: "Telemetry",
								status: "healthy" as const,
								message: "Telemetry service available",
								lastChecked: Date.now(),
								responseTime: telemetryTime,
							} satisfies ServiceHealth)
						),
						Effect.catchAll(() =>
							Effect.succeed(
								({
									serviceName: "Telemetry",
									status: "unhealthy" as const,
									message: "Telemetry service error",
									lastChecked: Date.now(),
									responseTime: Date.now() - startTime,
								} satisfies ServiceHealth)
							)
						)
					);

				case "mountain": {
					const mountain = yield* MountainTag;
					const mountainTime = Date.now() - startTime;
					return yield* mountain.version.pipe(
						Effect.map((version) =>
							({
								serviceName: "Mountain",
								status: "healthy" as const,
								message: `Mountain backend connected (v${version})`,
								lastChecked: Date.now(),
								responseTime: mountainTime,
								details: { version } as const,
							} satisfies ServiceHealth)
						),
						Effect.catchAll((error) =>
							Effect.succeed(
								({
									serviceName: "Mountain",
									status: "unhealthy" as const,
									message: `Mountain connection failed: ${String(error)}`,
									lastChecked: Date.now(),
									responseTime: Date.now() - startTime,
								} satisfies ServiceHealth)
							)
						)
					);
				}

				case "ipc":
					const ipcTime = Date.now() - startTime;
					return Effect.succeed(
						({
							serviceName: "IPC",
							status: "healthy" as const,
							message: "IPC service available",
							lastChecked: Date.now(),
							responseTime: ipcTime,
						} satisfies ServiceHealth)
					);

				case "configuration": {
					const config = yield* ConfigurationTag;
					const configTime = Date.now() - startTime;
					return yield* config.get.pipe(
						Effect.map(() =>
							({
								serviceName: "Configuration",
								status: "healthy" as const,
								message: "Configuration service available",
								lastChecked: Date.now(),
								responseTime: configTime,
							} satisfies ServiceHealth)
						),
						Effect.catchAll(() =>
							Effect.succeed(
								({
									serviceName: "Configuration",
									status: "unhealthy" as const,
									message: "Configuration service error",
									lastChecked: Date.now(),
									responseTime: configTime,
								} satisfies ServiceHealth)
							)
						)
					);
				}

				default:
					return Effect.succeed(
						({
							serviceName,
							status: "unknown" as const,
							message: `Unknown service: ${serviceName}`,
							lastChecked: Date.now(),
							responseTime: 0,
						} satisfies ServiceHealth)
					);
			}
		}),

	checkAllServices: () =>
		Effect.gen(function* () {
			const env = yield* EnvironmentTag;
			const envInfo = yield* env.getInfo;
			const services = ["environment", "telemetry", "mountain", "ipc", "configuration"] as const;
			const healthChecker = makeHealthChecker();

			const serviceHealthChecks = services.map((service) =>
				healthChecker.checkService(service),
			);

			const healthResults = yield* Effect.all(serviceHealthChecks);

			const unhealthyCount = healthResults.filter((h) => h.status === "unhealthy").length;
			const degradedCount = healthResults.filter((h) => h.status === "degraded").length;

			let overallStatus: HealthStatus = "healthy";
			if (unhealthyCount > 0) {
				overallStatus = "unhealthy";
			} else if (degradedCount > 0) {
				overallStatus = "degraded";
			}

			return {
				overallStatus,
				services: healthResults,
				systemInfo: {
					platform: envInfo.platform,
					architecture: envInfo.architecture,
					upSince: Date.now(),
				},
				lastChecked: Date.now(),
			} satisfies SystemHealth;
		}),

	getOverallStatus: () =>
		Effect.gen(function* () {
			const healthChecker = makeHealthChecker();
			const systemHealth = yield* healthChecker.checkAllServices();
			return systemHealth.overallStatus;
		}),

	monitorService: (serviceName: string, intervalMs: number) =>
		Effect.gen(function* () {
			yield* makeHealthChecker().checkService(serviceName).pipe(
				Effect.repeat(Schedule.spaced(`${intervalMs} millis`)),
			);
		}),
});

export const HealthLive = Layer.effect(
	HealthTag,
	Effect.succeed(makeHealthChecker()),
);

export const makeMockHealth = (overrides?: Partial<Record<string, HealthStatus>>): HealthService => ({
	checkService: (serviceName: string) =>
		Effect.gen(function* () {
			const defaultStatus: HealthStatus = "healthy";
			const status = overrides?.[serviceName] ?? defaultStatus;
			return ({
				serviceName,
				status,
				message: status === "healthy" ? "Mock service healthy" : "Mock service unhealthy",
				lastChecked: Date.now(),
				responseTime: 0,
			} satisfies ServiceHealth);
		}),

	checkAllServices: () =>
		Effect.gen(function* () {
			const services = ["environment", "telemetry", "mountain", "ipc", "configuration"];
			const results = services.map((name) =>
				({
					serviceName: name,
					status: overrides?.[name] ?? "healthy",
					message: "Mock service check",
					lastChecked: Date.now(),
					responseTime: 0,
				} satisfies ServiceHealth)
			);

			return {
				overallStatus: "healthy" as const,
				services: results,
				systemInfo: {
					platform: "mock",
					architecture: "mock",
					upSince: Date.now(),
				},
				lastChecked: Date.now(),
			} satisfies SystemHealth;
		}),

	getOverallStatus: () => Effect.succeed("healthy" as const),

	monitorService: () => Effect.void,
});

export const HealthMock = Layer.effect(HealthTag, Effect.succeed(makeMockHealth()));
