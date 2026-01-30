export declare class URI {
    static parse(value: string): URI;
    static file(path: string): URI;
    static revive(obj: any): URI;
    static from(obj: any): URI;
    scheme?: string;
}
export declare class Disposable {
    dispose(): void;
    _register<T extends IDisposable>(disposable: T): T;
}
export declare class ServiceCollection {
    set<T>(serviceId: any, instance: T): void;
}
export interface IMainProcessService {
}
export interface INativeWorkbenchEnvironmentService {
}
export interface IWorkspaceContextService {
}
export interface INativeHostService {
}
export interface IFileService {
}
export declare class Workbench {
    onWillShutdown(callback: (event: any) => void): IDisposable;
    onDidShutdown(callback: () => void): IDisposable;
}
export interface IProductService {
}
export interface IConfigurationService {
}
export interface IStorageService {
}
export interface ILogService {
}
export interface IDisposable {
    dispose(): void;
}
//# sourceMappingURL=MicrosoftVSCodeMocks.d.ts.map