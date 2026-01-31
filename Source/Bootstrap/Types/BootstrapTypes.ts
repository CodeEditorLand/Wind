/**
 * @module Bootstrap/Types/BootstrapTypes
 * @description
 * Bootstrap-specific type definitions.
 */

export type Platform = "tauri" | "browser";
export type Mode = "development" | "production";
export type StageName =
	| "Environment"
	| "Preload"
	| "Configuration"
	| "Services"
	| "Preparation"
	| "Initialization"
	| "HealthCheck";

export type ErrorSeverity = "critical" | "warning" | "info";

export interface StageResult {
	success: boolean;
	stage: StageName;
	duration: number;
	data?: any;
	error?: Error;
	critical?: boolean;
	warnings?: string[];
}

export interface BootstrapResult {
	success: boolean;
	results: StageResult[];
	totalDuration: number;
}

export interface BootstrapConfig {
	debugMode: boolean;
	verboseLogging: boolean;
	showStatusUI: boolean;
	pauseBetweenStages: boolean;
	enablePerformanceTracking: boolean;
}

export interface StatusUpdate {
	stage: StageName;
	status: "pending" | "running" | "success" | "error" | "warning";
	message: string;
	progress: number;
	duration?: number;
	error?: Error;
}

export interface EnvironmentData {
	platform: Platform;
	mode: Mode;
	userAgent: string;
	language: string;
	timezone: string;
}

export interface ConfigurationData {
	windowId: string;
	machineId: string;
	sessionId: string;
	appRoot: string;
	userDataPath: string;
	platform: string;
	arch: string;
	logLevel: number;
	[key: string]: any;
}

export interface ServiceData {
	servicesRegistered: string[];
	servicesFailed: string[];
	serviceCount: number;
}

export interface WorkbenchData {
	initialized: boolean;
	running: boolean;
	servicesReady: boolean;
	error?: Error;
}
