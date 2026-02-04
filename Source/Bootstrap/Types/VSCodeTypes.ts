/**
 * @module Bootstrap/Types/VSCodeTypes
 * @description
 * VSCode-specific type definitions for integration.
 */

/**
 * VSCode Workbench Construction Options
 * Based on vs/workbench/browser/web.factory.ts
 */
export interface IVSCodeWorkbenchOptions {
	// Connection
	remoteAuthority?: string;
	serverBasePath?: string;
	connectionToken?: string | Promise<string>;
	webviewEndpoint?: string;
	webSocketFactory?: IWebSocketFactory;
	resourceUriProvider?: IResourceUriProvider;
	resolveExternalUri?: IExternalUriResolver;
	tunnelProvider?: ITunnelProvider;
	codeExchangeProxyEndpoints?: { [providerId: string]: string };
	editSessionId?: string;
	remoteResourceProvider?: IRemoteResourceProvider;

	// Workbench
	workspaceProvider?: IWorkspaceProvider;
	settingsSyncOptions?: ISettingsSyncOptions;
	secretStorageProvider?: ISecretStorageProvider;
	additionalBuiltinExtensions?: readonly (
		| MarketplaceExtension
		| UriComponents
	)[];
	enabledExtensions?: readonly ExtensionId[];
	additionalTrustedDomains?: string[];
	enableWorkspaceTrust?: boolean;
	openerAllowedExternalUrlPrefixes?: string[];
	urlCallbackProvider?: IURLCallbackProvider;
	resolveCommonTelemetryProperties?: ICommonTelemetryPropertiesResolver;
	commands?: readonly ICommand[];
	defaultLayout?: IDefaultLayout;
	configurationDefaults?: Record<string, unknown>;

	// Profile
	profile?: {
		readonly name: string;
		readonly contents?: string | UriComponents;
	};
	profileToPreview?: UriComponents;

	// Update/Quality
	updateProvider?: IUpdateProvider;
	productQualityChangeHandler?: IProductQualityChangeHandler;

	// Branding
	welcomeBanner?: IWelcomeBanner;
	productConfiguration?: Partial<IProductConfiguration>;
	windowIndicator?: IWindowIndicator;
	initialColorTheme?: IInitialColorTheme;

	// IPC
	messagePorts?: ReadonlyMap<ExtensionId, MessagePort>;

	// Authentication
	authenticationProviders?: readonly IAuthenticationProvider[];

	// Development
	developmentOptions?: IDevelopmentOptions;
}

/**
 * VSCode Service Collection Interface
 */
export interface IVSCodeServiceCollection {
	set<T>(id: IVSCodeServiceIdentifier, instance: T): void;
	get<T>(id: IVSCodeServiceIdentifier): T;
	has(id: IVSCodeServiceIdentifier): boolean;
}

/**
 * VSCode Service Identifier
 */
export interface IVSCodeServiceIdentifier {
	_serviceBrand: undefined;
	toString(): string;
}

/**
 * VSCode Environment Service Interface
 */
export interface IVSCodeEnvironmentService {
	_serviceBrand: undefined;
	machineId: string;
	sessionId: string;
	remoteAuthority?: string;
	isExtensionDevelopment: boolean;
	execPath: string;
	userHome: string;
	userDataPath: string;
	logPath: string;
	extHostLogsPath: string;
	extensionsPath: string;
	logsPath: string;
	argvResource: string;
	workspaceStorageHome: string;
	userRoamingDataHome: string;
	crashReporterDirectory?: string;
	disableExtensions: boolean;

	// Window configuration
	windowId: number;
	window: {
		configuration: any;
	};
}

/**
 * VSCode Configuration Service Interface
 */
export interface IVSCodeConfigurationService {
	_serviceBrand: undefined;
	onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
	getValue<T>(section?: string): T;
	updateValue(
		key: string,
		value: any,
		target?: ConfigurationTarget,
	): Promise<void>;
	inspect<T>(key: string): {
		default: T;
		user: T;
		workspace?: T;
		workspaceFolder?: T;
		memory?: T;
	};
}

/**
 * VSCode Logger Service Interface
 */
export interface IVSCodeLoggerService {
	_serviceBrand: undefined;
	createLogger(file: string, options?: ILoggerOptions): ILogger;
	getLogger(file: string): ILogger | undefined;
	dispose(): void;
}

/**
 * Supporting interfaces for VSCode types
 */
export interface IWebSocketFactory {
	create(url: string): IWebSocket;
}

export interface IWebSocket {
	readonly onData: Event<ArrayBuffer>;
	readonly onOpen: Event<void>;
	readonly onClose: Event<void>;
	readonly onError: Event<any>;
	send(data: ArrayBuffer): void;
	close(): void;
}

export interface IResourceUriProvider {
	(uri: UriComponents): UriComponents;
}

export interface IExternalUriResolver {
	(uri: UriComponents): Promise<UriComponents>;
}

export interface ITunnelProvider {
	forwardPort?(tunnelOptions: ITunnelOptions): Promise<ITunnel>;
}

export interface IRemoteResourceProvider {
	provideResource(uri: UriComponents): Promise<Uint8Array>;
}

export interface IWorkspaceProvider {
	workspace?: IWorkspace;
	trusted?: boolean;
}

export interface ISettingsSyncOptions {
	enabled: boolean;
}

export interface ISecretStorageProvider {
	get(key: string): Promise<string | undefined>;
	set(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface IURLCallbackProvider {
	create(options: { url: string }): Promise<URI>;
}

export interface ICommonTelemetryPropertiesResolver {
	(): { [key: string]: any };
}

export interface ICommand {
	id: string;
	handler: (...args: any[]) => any;
}

export interface IDefaultLayout {
	editors?: any[];
}

export interface IUpdateProvider {
	available: boolean;
}

export interface IProductQualityChangeHandler {
	(quality: string): void;
}

export interface IWelcomeBanner {
	title: string;
	message: string;
	icon: string;
}

export interface IProductConfiguration {
	nameShort: string;
	nameLong: string;
	applicationName: string;
	version: string;
	commit: string;
	date: string;
}

export interface IWindowIndicator {
	label: string;
	tooltip: string;
}

export interface IInitialColorTheme {
	theme: string;
}

export interface IAuthenticationProvider {
	id: string;
	label: string;
}

export interface IDevelopmentOptions {
	enableSmokeTestDriver?: boolean;
	extensionTestsPath?: string;
}

/**
 * Basic VSCode interfaces
 */
export interface Event<T> {
	(listener: (e: T) => any): IDisposable;
}

export interface IDisposable {
	dispose(): void;
}

export interface IConfigurationChangeEvent {
	affectsConfiguration(section: string, resource?: URI): boolean;
}

export enum ConfigurationTarget {
	USER = 1,
	WORKSPACE = 2,
	WORKSPACE_FOLDER = 3,
	DEFAULT = 4,
	MEMORY = 5,
}

export interface ILoggerOptions {
	name?: string;
	logLevel?: LogLevel;
}

export interface ILogger {
	trace(message: string, ...args: any[]): void;
	debug(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
	critical(message: string, ...args: any[]): void;
}

export enum LogLevel {
	Trace = 0,
	Debug = 1,
	Info = 2,
	Warning = 3,
	Error = 4,
	Critical = 5,
	Off = 6,
}

/**
 * URI and utility types
 */
export interface UriComponents {
	scheme: string;
	authority?: string;
	path: string;
	query?: string;
	fragment?: string;
}

export interface URI {
	scheme: string;
	authority?: string;
	path: string;
	query?: string;
	fragment?: string;
	toString(): string;
}

export interface IWorkspace {
	id: string;
	folders: IWorkspaceFolder[];
	configuration?: UriComponents;
}

export interface IWorkspaceFolder {
	uri: UriComponents;
	name: string;
	index: number;
}

export type ExtensionId = string;
export type MarketplaceExtension = any;
export type ITunnelOptions = any;
export type ITunnel = any;
