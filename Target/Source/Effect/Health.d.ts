/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 */
import { Effect, Layer } from "effect";
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
export interface ServiceHealth {
    readonly serviceName: string;
    readonly status: HealthStatus;
    readonly message: string;
    readonly lastChecked: number;
    readonly responseTime?: number;
    readonly details?: Readonly<Record<string, unknown>>;
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
    readonly checkService: (serviceName: string) => Effect.Effect<ServiceHealth>;
    readonly checkAllServices: () => Effect.Effect<SystemHealth>;
    readonly getOverallStatus: () => Effect.Effect<HealthStatus>;
    readonly monitorService: (serviceName: string, intervalMs: number) => Effect.Effect<void>;
}
export declare const HealthTag: any;
export declare const HealthLive: Layer.Layer<unknown, unknown, unknown>;
export declare const makeMockHealth: (overrides?: Partial<Record<string, HealthStatus>>) => HealthService;
export declare const HealthMock: Layer.Layer<unknown, never, never>;
//# sourceMappingURL=Health.d.ts.map