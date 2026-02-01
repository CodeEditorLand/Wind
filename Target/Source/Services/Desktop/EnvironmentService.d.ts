/**
 * @module DesktopWorkbenchEnvironmentService
 * @description
 * Tauri implementation of VSCode's INativeWorkbenchEnvironmentService.
 * Provides environment configuration and paths for desktop workbench.
 *
 * Architecture:
 * 1. Path resolution for Tauri environment
 * 2. Configuration management
 * 3. Platform-specific settings
 *
 * TODOs:
 * - Implement proper Tauri path resolution
 * - Add Tauri-specific environment variables
 * - Handle platform-specific configurations
 * - Integrate with Tauri app and path APIs
 */
import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import { INativeWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/electron-browser/environmentService.js";
export declare class DesktopWorkbenchEnvironmentService implements INativeWorkbenchEnvironmentService {
    private readonly configuration;
    private readonly productService;
    readonly _serviceBrand: undefined;
    readonly isBuilt: boolean;
    readonly isExtensionDevelopment: boolean;
    readonly disableExtensions: boolean;
    readonly extensionDevelopmentLocationURI: URI[] | undefined;
    readonly extensionTestsLocationURI: URI | undefined;
    readonly debugExtensionHost: {
        port: number;
        break: boolean;
    } | undefined;
    readonly debugRenderer: boolean;
    readonly enableSmokeTestDriver: boolean;
    readonly logLevel: string | undefined;
    readonly verbose: boolean;
    readonly logFile: URI | undefined;
    readonly args: any;
    readonly appRoot: string;
    readonly userHome: URI;
    readonly userDataPath: string;
    readonly appSettingsHome: URI;
    readonly userRoamingDataHome: URI;
    readonly settingsResource: URI;
    readonly argvResource: URI;
    readonly backupWorkspaceHome: URI;
    readonly windowLogsPath: URI;
    readonly logFile: URI;
    readonly extHostLogsPath: URI;
    readonly window: {
        id: number;
        maxWidth?: number;
        maxHeight?: number;
        maximized?: boolean;
    };
    readonly remoteAuthority: string | undefined;
    constructor(configuration: any, productService: IProductService);
    private initializePaths;
    get machineId(): string;
    get sessionId(): string;
    get filesToWait(): any;
    get continueOn(): string | undefined;
    get crashReporterDirectory(): URI | undefined;
    get disableHardwareAcceleration(): boolean;
    get extensionEnabledProposedApi(): string[] | undefined;
    get extensionTelemetryLogResource(): URI | undefined;
    get os(): {
        release: string;
        hostname: string;
    };
    get product(): any;
    get execPath(): string;
    get cliPath(): string | undefined;
    get skipReleaseNotes(): boolean;
    get logsHome(): URI;
    get logExtensionHostCommunication(): boolean;
    get extensionLogLevel(): [string, string][] | undefined;
    get extensionTelemetryEndpoint(): string | undefined;
    get uiExtensions(): {
        location: URI;
        id: string;
    }[] | undefined;
    get enableKeytar(): boolean;
    get crossOriginIsolated(): boolean;
    get nodeCachedDataDir(): string | undefined;
    get sharedIPCHandle(): string | undefined;
    get policyFile(): URI | undefined;
    get profiles(): any;
    get useNativeTitleBar(): boolean;
    get sandbox(): boolean;
    get driver(): boolean;
    get statusBarVisibility(): "visible" | "toggle" | "hidden";
    get zenMode(): {
        hide: boolean;
        restore: boolean;
    } | undefined;
    get skipWelcome(): boolean;
    get skipReleaseNotes(): boolean;
    get disableWorkspaceTrust(): boolean;
    get enableWorkspaceTrust(): boolean;
    get workspaceTrustEnablement(): "on" | "off" | "limited";
    get workspaceTrustRequestOnStartup(): boolean;
    get skipAddToRecentlyOpened(): boolean;
    get disableTelemetry(): boolean;
    get telemetryLogLevel(): "error" | "info" | "verbose" | undefined;
    get telemetryEndpoint(): string | undefined;
    get telemetryMachineId(): string | undefined;
    get extensionDevelopmentKind(): string[] | undefined;
    get extensionDevelopmentLocationURI(): URI[] | undefined;
    get extensionTestsLocationURI(): URI | undefined;
    get debugExtensionHost(): {
        port: number;
        break: boolean;
    } | undefined;
    get logFile(): URI | undefined;
    get extHostLogsPath(): URI | undefined;
}
//# sourceMappingURL=EnvironmentService.d.ts.map