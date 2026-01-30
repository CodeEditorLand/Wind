/**
 * VSCode Workbench Adapter for Wind/Tauri
 *
 * Advanced selective and defensive implementation of VSCode workbench features
 * that work seamlessly in Wind/Tauri environment while maintaining compatibility
 * with original VSCode workbench APIs and patterns.
 *
 * Key Features:
 * - Selective implementation of VSCode workbench APIs
 * - Defensive error handling with graceful degradation
 * - Tauri-specific optimizations for Wind environment
 * - Comprehensive coverage of workbench functionality
 */
/**
 * VSCode Workbench Service Interface
 * Maps VSCode workbench services to Wind/Tauri equivalents
 */
export interface IVSCodeWorkbenchAdapter {
    fileService: IVSCodeFileService;
    textFileService: IVSCodeTextFileService;
    editorService: IVSCodeEditorService;
    editorGroupService: IVSCodeEditorGroupService;
    layoutService: IVSCodeLayoutService;
    configurationService: IVSCodeConfigurationService;
    extensionService: IVSCodeExtensionService;
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    getWorkbenchStatus(): IWorkbenchStatus;
}
/**
 * VSCode File Service Interface (adapted for Wind/Tauri)
 */
export interface IVSCodeFileService {
    readFile(uri: string): Promise<string>;
    writeFile(uri: string, content: string): Promise<void>;
    deleteFile(uri: string): Promise<void>;
    existsFile(uri: string): Promise<boolean>;
    createDirectory(uri: string): Promise<void>;
    readDirectory(uri: string): Promise<string[]>;
    deleteDirectory(uri: string): Promise<void>;
    watchFile(uri: string, callback: (event: FileChangeEvent) => void): Promise<FileWatcher>;
    syncFileSystem(): Promise<void>;
}
/**
 * VSCode Text File Service Interface
 */
export interface IVSCodeTextFileService {
    readTextFile(uri: string, encoding?: string): Promise<string>;
    writeTextFile(uri: string, content: string, encoding?: string): Promise<void>;
    detectEncoding(uri: string): Promise<string>;
    detectLineEndings(uri: string): Promise<string>;
    enableAutoSave(): void;
    disableAutoSave(): void;
}
/**
 * VSCode Editor Service Interface
 */
export interface IVSCodeEditorService {
    openEditor(uri: string, options?: EditorOptions): Promise<IEditor>;
    closeEditor(editor: IEditor): Promise<void>;
    getActiveEditor(): IEditor | null;
    setActiveEditor(editor: IEditor): Promise<void>;
    getEditorGroups(): IEditorGroup[];
    createEditorGroup(): Promise<IEditorGroup>;
    saveEditor(editor: IEditor): Promise<void>;
    revertEditor(editor: IEditor): Promise<void>;
}
/**
 * VSCode Layout Service Interface
 */
export interface IVSCodeLayoutService {
    getLayout(): ILayout;
    setLayout(layout: ILayout): Promise<void>;
    registerPart(part: IPart): Promise<void>;
    unregisterPart(part: IPart): Promise<void>;
    focusPart(part: IPart): Promise<void>;
    blurPart(part: IPart): Promise<void>;
    showPart(part: IPart): Promise<void>;
    hidePart(part: IPart): Promise<void>;
}
/**
 * VSCode Configuration Service Interface
 */
export interface IVSCodeConfigurationService {
    getConfiguration(section?: string): Promise<any>;
    updateConfiguration(section: string, value: any): Promise<void>;
    syncSettings(): Promise<void>;
    getWorkspaceSettings(): Promise<any>;
    updateWorkspaceSettings(settings: any): Promise<void>;
}
/**
 * VSCode Extension Service Interface
 */
export interface IVSCodeExtensionService {
    installExtension(extensionId: string): Promise<void>;
    uninstallExtension(extensionId: string): Promise<void>;
    activateExtension(extensionId: string): Promise<void>;
    deactivateExtension(extensionId: string): Promise<void>;
    sendToExtensionHost(message: any): Promise<any>;
    getExtensions(): IExtension[];
    getExtensionStatus(extensionId: string): Promise<IExtensionStatus>;
}
/**
 * Main VSCode Workbench Adapter Implementation
 */
export declare class VSCodeWorkbenchAdapter implements IVSCodeWorkbenchAdapter {
    private isInitialized;
    private fileService;
    private textFileService;
    private editorService;
    private editorGroupService;
    private layoutService;
    private configurationService;
    private extensionService;
    constructor();
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    getWorkbenchStatus(): IWorkbenchStatus;
    private setupVSCodeEventListeners;
    private handleFileChange;
    private handleEditorChange;
    private handleLayoutChange;
    private handleConfigurationChange;
    get fileService(): IVSCodeFileService;
    get textFileService(): IVSCodeTextFileService;
    get editorService(): IVSCodeEditorService;
    get layoutService(): IVSCodeLayoutService;
    get configurationService(): IVSCodeConfigurationService;
    get extensionService(): IVSCodeExtensionService;
}
/**
 * Interface definitions for comprehensive coverage
 */
interface IWorkbenchStatus {
    isInitialized: boolean;
    services: {
        fileService: IServiceStatus;
        textFileService: IServiceStatus;
        editorService: IServiceStatus;
        layoutService: IServiceStatus;
        configurationService: IServiceStatus;
        extensionService: IServiceStatus;
    };
    performance: any;
    synchronization: any;
}
interface IServiceStatus {
    isInitialized: boolean;
    lastOperation: string;
    errorCount: number;
}
interface FileChangeEvent {
    type: 'created' | 'modified' | 'deleted';
    uri: string;
    timestamp: number;
}
interface FileWatcher {
    unwatch(): Promise<void>;
}
interface EditorOptions {
    preserveFocus?: boolean;
    preview?: boolean;
    pinned?: boolean;
}
interface IEditor {
    id: string;
    uri: string;
    isDirty: boolean;
    isActive: boolean;
}
interface IEditorGroup {
    id: string;
    activeEditor: IEditor | null;
    editors: IEditor[];
}
interface ILayout {
    parts: IPart[];
    activePart: IPart | null;
}
interface IPart {
    id: string;
    type: string;
    isVisible: boolean;
    isFocused: boolean;
}
interface IExtension {
    id: string;
    name: string;
    version: string;
    isActive: boolean;
}
interface IExtensionStatus {
    isActive: boolean;
    activationTime: number;
    errorCount: number;
}
export declare const vscodeWorkbenchAdapter: VSCodeWorkbenchAdapter;
export {};
//# sourceMappingURL=VSCodeWorkbenchAdapter.d.ts.map