/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Replaces VSCode's platform detection from Stage0.
 */
import { Effect, Context, Layer } from "effect";
export type Platform = "win32" | "darwin" | "linux" | "web";
export type Architecture = "x64" | "arm64" | "arm" | "web";
export interface EnvironmentInfo {
    readonly platform: Platform;
    readonly architecture: Architecture;
    readonly locale: string;
    readonly timezone: string;
    readonly userAgent: string;
    readonly isSecureContext: boolean;
    readonly language: string;
}
export interface EnvironmentService {
    readonly getInfo: Effect.Effect<EnvironmentInfo>;
    readonly getPlatform: Effect.Effect<Platform>;
    readonly getArchitecture: Effect.Effect<Architecture>;
    readonly isWindows: Effect.Effect<boolean>;
    readonly isMac: Effect.Effect<boolean>;
    readonly isLinux: Effect.Effect<boolean>;
    readonly isWeb: Effect.Effect<boolean>;
}
declare const EnvironmentTag_base: Context.TagClass<EnvironmentTag, "Effect/EnvironmentService", EnvironmentService>;
export declare class EnvironmentTag extends EnvironmentTag_base {
}
export declare const EnvironmentLive: Layer.Layer<EnvironmentTag, never, never>;
export declare const makeMockEnvironment: (overrides?: Partial<EnvironmentInfo>) => EnvironmentService;
export declare const EnvironmentMock: Layer.Layer<EnvironmentTag, never, never>;
export {};
//# sourceMappingURL=Environment.d.ts.map