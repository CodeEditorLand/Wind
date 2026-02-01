/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Replaces VSCode's platform detection from Stage0.
 */

import { Effect, Context, Layer } from "effect";

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// SERVICE TAG
// ============================================================================

export class EnvironmentTag extends Context.Tag("Effect/EnvironmentService")<
	EnvironmentTag,
	EnvironmentService
>() {}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

const detectPlatform = (): Platform => {
	if (typeof navigator === "undefined") {
		return "web";
	}

	const platform = navigator.platform?.toLowerCase() || "";

	if (platform.includes("win")) {
		return "win32";
	}
	if (platform.includes("mac")) {
		return "darwin";
	}
	if (platform.includes("linux") || platform.includes("ubuntu")) {
		return "linux";
	}

	return "web";
};

const detectArchitecture = (): Architecture => {
	// Web platform doesn't expose architecture
	if (typeof navigator === "undefined") {
		return "web";
	}

	// Try to detect from user agent
	const userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.includes("arm") || userAgent.includes("aarch64")) {
		return "arm64";
	}

	// Default to x64 for web
	return "x64";
};

const detectLocale = (): string => {
	if (typeof navigator === "undefined") {
		return "en-US";
	}

	return navigator.language || "en-US";
};

const detectTimezone = (): string => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
};

const getUserAgent = (): string => {
	if (typeof navigator === "undefined") {
		return "Unknown";
	}

	return navigator.userAgent || "Unknown";
};

const makeLiveEnvironment: EnvironmentService = {
	getInfo: Effect.sync(() => ({
		platform: detectPlatform(),
		architecture: detectArchitecture(),
		locale: detectLocale(),
		timezone: detectTimezone(),
		userAgent: getUserAgent(),
		isSecureContext: typeof window !== "undefined" && window.isSecureContext,
		language: detectLocale().split("-")[0] || "en",
	})),
	getPlatform: Effect.sync(detectPlatform),
	getArchitecture: Effect.sync(detectArchitecture),
	isWindows: Effect.map(Effect.sync(detectPlatform), (p) => p === "win32"),
	isMac: Effect.map(Effect.sync(detectPlatform), (p) => p === "darwin"),
	isLinux: Effect.map(Effect.sync(detectPlatform), (p) => p === "linux"),
	isWeb: Effect.map(Effect.sync(detectPlatform), (p) => p === "web"),
};

// ============================================================================
// LAYERS
// ============================================================================

export const EnvironmentLive = Layer.effect(
	EnvironmentTag,
	Effect.succeed(makeLiveEnvironment),
);

// ============================================================================
// MOCK FOR TESTING
// ============================================================================

export const makeMockEnvironment = (overrides?: Partial<EnvironmentInfo>): EnvironmentService => {
	const mockInfo: EnvironmentInfo = {
		platform: "web",
		architecture: "x64",
		locale: "en-US",
		timezone: "UTC",
		userAgent: "Mock",
		isSecureContext: true,
		language: "en",
		...overrides,
	};

	return {
		getInfo: Effect.sync(() => mockInfo),
		getPlatform: Effect.sync(() => mockInfo.platform),
		getArchitecture: Effect.sync(() => mockInfo.architecture),
		isWindows: Effect.sync(() => mockInfo.platform === "win32"),
		isMac: Effect.sync(() => mockInfo.platform === "darwin"),
		isLinux: Effect.sync(() => mockInfo.platform === "linux"),
		isWeb: Effect.sync(() => mockInfo.platform === "web"),
	};
};

export const EnvironmentMock = Layer.effect(
	EnvironmentTag,
	Effect.succeed(makeMockEnvironment()),
);
