/**
 * @module Effect/Health/Implementation/HealthImplementation
 * @description
 * Main implementation of the Health monitoring service.
 * @category Implementation
 */

import { Effect, Layer, Schedule } from "effect";

import { ConfigurationTag } from "../../Configuration.js";
import { EnvironmentTag } from "../../Environment.js";
import { MountainTag } from "../../Mountain.js";
import { TelemetryTag } from "../../Telemetry.js";
import { HealthTag } from "../Tag/HealthTag.js";
import type {
	HealthService,
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "../Type/HealthType.js";

export const makeHealthChecker = (): HealthService => ({
	checkService: (ServiceName: string) =>
		Effect.gen(function* () {
			const StartTime = Date.now();

			switch (ServiceName.toLowerCase()) {
				case "environment":
					const EnvTime = Date.now() - StartTime;
					return Effect.succeed({
						serviceName: "Environment",
						status: "healthy" as const,
						message: "Environment service available",
						lastChecked: Date.now(),
						responseTime: EnvTime,
					} satisfies ServiceHealth);

				case "telemetry":
					const TelemetryService = yield* TelemetryTag;
					const TelemetryTime = Date.now() - StartTime;
					return yield* TelemetryService.log(
						"info",
						"[Health] Telemetry health check",
					).pipe(
						Effect.map(
							() =>
								({
									serviceName: "Telemetry",
									status: "healthy" as const,
									message: "Telemetry service available",
									lastChecked: Date.now(),
									responseTime: TelemetryTime,
								}) satisfies ServiceHealth,
						),
						Effect.catchAll(() =>
							Effect.succeed({
								serviceName: "Telemetry",
								status: "unhealthy" as const,
								message: "Telemetry service error",
								lastChecked: Date.now(),
								responseTime: Date.now() - StartTime,
							} satisfies ServiceHealth),
						),
					);

				case "mountain": {
					const Mountain = yield* MountainTag;
					const MountainTime = Date.now() - StartTime;
					return yield* Mountain.version.pipe(
						Effect.map(
							(version) =>
								({
									serviceName: "Mountain",
									status: "healthy" as const,
									message: `Mountain backend connected (v${version})`,
									lastChecked: Date.now(),
									responseTime: MountainTime,
									details: { version } as const,
								}) satisfies ServiceHealth,
						),
						Effect.catchAll((error) =>
							Effect.succeed({
								serviceName: "Mountain",
								status: "unhealthy" as const,
								message: `Mountain connection failed: ${String(error)}`,
								lastChecked: Date.now(),
								responseTime: Date.now() - StartTime,
							} satisfies ServiceHealth),
						),
					);
				}

				case "ipc":
					const IpcTime = Date.now() - StartTime;
					return Effect.succeed({
						serviceName: "IPC",
						status: "healthy" as const,
						message: "IPC service available",
						lastChecked: Date.now(),
						responseTime: IpcTime,
					} satisfies ServiceHealth);

				case "configuration": {
					const Config = yield* ConfigurationTag;
					const ConfigTime = Date.now() - StartTime;
					return yield* Config.get.pipe(
						Effect.map(
							() =>
								({
									serviceName: "Configuration",
									status: "healthy" as const,
									message: "Configuration service available",
									lastChecked: Date.now(),
									responseTime: ConfigTime,
								}) satisfies ServiceHealth,
						),
						Effect.catchAll(() =>
							Effect.succeed({
								serviceName: "Configuration",
								status: "unhealthy" as const,
								message: "Configuration service error",
								lastChecked: Date.now(),
								responseTime: ConfigTime,
							} satisfies ServiceHealth),
						),
					);
				}

				default:
					return Effect.succeed({
						serviceName: ServiceName,
						status: "unknown" as const,
						message: `Unknown service: ${ServiceName}`,
						lastChecked: Date.now(),
						responseTime: 0,
					} satisfies ServiceHealth);
			}
		}),

	checkAllServices: () =>
		Effect.gen(function* () {
			const Env = yield* EnvironmentTag;
			const EnvInfo = yield* Env.getInfo;
			const Services = [
				"environment",
				"telemetry",
				"mountain",
				"ipc",
				"configuration",
			] as const;
			const HealthChecker = makeHealthChecker();

			const ServiceHealthChecks = Services.map((Service) =>
				HealthChecker.checkService(Service),
			);

			const HealthResults = yield* Effect.all(ServiceHealthChecks);

			const UnhealthyCount = HealthResults.filter(
				(h: ServiceHealth) => h.status === "unhealthy",
			).length;
			const DegradedCount = HealthResults.filter(
				(h: ServiceHealth) => h.status === "degraded",
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
					platform: EnvInfo.platform,
					architecture: EnvInfo.architecture,
					upSince: Date.now(),
				},
				lastChecked: Date.now(),
			} satisfies SystemHealth;
		}),

	getOverallStatus: () =>
		Effect.gen(function* () {
			const HealthChecker = makeHealthChecker();
			const SystemHealth = yield* HealthChecker.checkAllServices();
			return SystemHealth.overallStatus;
		}),

	monitorService: (ServiceName: string, IntervalMs: number) =>
		Effect.gen(function* () {
			yield* makeHealthChecker()
				.checkService(ServiceName)
				.pipe(Effect.repeat(Schedule.spaced(`${IntervalMs} millis`)));
		}),
});

export const HealthLive = Layer.effect(
	HealthTag,
	Effect.succeed(makeHealthChecker()),
);

export const makeMockHealth = (
	Overrides?: Partial<Record<string, HealthStatus>>,
): HealthService => ({
	checkService: (ServiceName: string) =>
		Effect.gen(function* () {
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
		}),

	checkAllServices: () =>
		Effect.gen(function* () {
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
		}),

	getOverallStatus: () => Effect.succeed("healthy" as const),

	monitorService: () => Effect.void,
});

export const HealthMock = Layer.effect(
	HealthTag,
	Effect.succeed(makeMockHealth()),
);
