/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 */
import { Effect, Context, Layer } from "effect";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
export interface ServiceHealth {
    readonly serviceName: string;
    readonly status: HealthStatus;
    readonly message: string;
    readonly lastChecked: number;
    readonly responseTime: number;
    readonly details: Readonly<Record<string, unknown>> | undefined;
}
export interface SystemHealth {
    readonly overallStatus: HealthStatus;
    readonly services: ReadonlyArray<ServiceHealth>;
    readonly systemInfo: {
        readonly platform: string;
        readonly architecture: string;
        readonly upSince: number;
    };
    readonly lastChecked: number;
}
export interface HealthService {
    readonly checkService: (serviceName: string) => Effect.Effect<ServiceHealth, never>;
    readonly checkAllServices: () => Effect.Effect<SystemHealth, never>;
    readonly getOverallStatus: () => Effect.Effect<HealthStatus, never>;
    readonly monitorService: (serviceName: string, intervalMs: number) => Effect.Effect<void, never>;
}
declare const HealthTag_base: Context.TagClass<HealthTag, "Effect/HealthService", HealthService>;
export declare class HealthTag extends HealthTag_base {
}
export declare const HealthLive: Layer.Layer<HealthTag, never, never>;
export declare const makeMockHealth: (overrides?: Partial<Record<string, HealthStatus>>) => HealthService;
export declare const HealthMock: Layer.Layer<HealthTag, never, never>;
export {};
//# sourceMappingURL=Health.d.ts.map