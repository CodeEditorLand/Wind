/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeWorkbenchOptionsType
 * @description
 * Supporting types for VSCode Workbench Options.
 * @category Type
 */

export interface IAuthenticationProvider {
	id: string;
	label: string;
}

export interface ICommand {
	id: string;
	handler: (...args: any[]) => any;
}

export interface IDefaultLayout {
	editors?: any[];
}

export interface ICommonTelemetryPropertiesResolver {
	(): { [key: string]: any };
}

export interface IDevelopmentOptions {
	enableSmokeTestDriver?: boolean;
	extensionTestsPath?: string;
}

export interface IInitialColorTheme {
	theme: string;
}

export interface IProductConfiguration {
	nameShort: string;
	nameLong: string;
	applicationName: string;
	version: string;
	commit: string;
	date: string;
}

export interface IProductQualityChangeHandler {
	(quality: string): void;
}

export interface ISecretStorageProvider {
	get(key: string): Promise<string | undefined>;
	set(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface ISettingsSyncOptions {
	enabled: boolean;
}

export interface IUpdateProvider {
	available: boolean;
}

export interface IUrlCallbackProvider {
	create(options: { url: string }): Promise<unknown>;
}

export interface IWelcomeBanner {
	title: string;
	message: string;
	icon: string;
}

export interface IWindowIndicator {
	label: string;
	tooltip: string;
}

export interface IWorkspaceProvider {
	workspace?: IWorkspace;
	trusted?: boolean;
}

export interface IWorkspace {
	id: string;
	folders: IWorkspaceFolder[];
	configuration?: unknown;
}

export interface IWorkspaceFolder {
	uri: unknown;
	name: string;
	index: number;
}

export interface ITunnelProvider {
	forwardPort?(tunnelOptions: unknown): Promise<unknown>;
}
