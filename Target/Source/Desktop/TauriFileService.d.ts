/**
 * @module TauriFileService
 * @description
 * Tauri File Service implementation for VSCode workbench integration.
 * Replaces Electron's file system service with Tauri's file system APIs.
 *
 * Architecture:
 * - Uses Tauri's filesystem API for file operations
 * - Implements VSCode IFileService interface
 * - Provides file watching capabilities
 * - Handles file system events and errors
 *
 * VSCode Source Reference: `vs/platform/files/common/files.ts`
 * TODO: Complete file watching implementation
 * TODO: Implement proper error handling and recovery
 * TODO: Add file system event propagation
 */
/**
 * File system entry interface
 */
interface IFileSystemEntry {
    readonly path: string;
    readonly name: string;
    readonly isDirectory: boolean;
    readonly size?: number;
    readonly modified?: number;
    readonly created?: number;
}
/**
 * File system event
 */
interface IFileSystemEvent {
    type: "created" | "modified" | "deleted" | "renamed";
    path: string;
    oldPath?: string;
}
/**
 * File service options
 */
interface IFileServiceOptions {
    enableFileWatching: boolean;
    enableRecursiveWatching: boolean;
    pollingInterval?: number;
}
/**
 * Tauri File Service implementation
 */
export declare class TauriFileService {
    private watchers;
    private eventListeners;
    private options;
    constructor(options?: Partial<IFileServiceOptions>);
    /**
     * Check if file or directory exists
     */
    exists(path: string): Promise<boolean>;
    /**
     * Read file as text
     */
    readFile(path: string, encoding?: string): Promise<string>;
    /**
     * Read file as binary
     */
    readFileBinary(path: string): Promise<Uint8Array>;
    /**
     * Write text to file
     */
    writeFile(path: string, content: string, encoding?: string): Promise<void>;
    /**
     * Write binary data to file
     */
    writeFileBinary(path: string, content: Uint8Array): Promise<void>;
    /**
     * Create directory
     */
    createDirectory(path: string, recursive?: boolean): Promise<void>;
    /**
     * Delete file or directory
     */
    delete(path: string, recursive?: boolean): Promise<void>;
    /**
     * Copy file
     */
    copy(source: string, target: string): Promise<void>;
    /**
     * Move/rename file
     */
    move(source: string, target: string): Promise<void>;
    /**
     * List directory contents
     */
    readDirectory(path: string): Promise<IFileSystemEntry[]>;
    /**
     * Get file statistics
     */
    stat(path: string): Promise<IFileSystemEntry>;
    /**
     * Watch file or directory for changes
     */
    watch(path: string, recursive?: boolean): Promise<string>;
    /**
     * Stop watching file or directory
     */
    unwatch(watchId: string): Promise<void>;
    /**
     * Handle file system events from watcher
     */
    private handleFileSystemEvent;
    /**
     * Map Tauri event type to VSCode event type
     */
    private mapEventType;
    /**
     * Notify event listeners
     */
    private notifyEventListeners;
    /**
     * Add event listener for file system events
     */
    onFileEvent(path: string, listener: (event: IFileSystemEvent) => void): void;
    /**
     * Remove event listener
     */
    offFileEvent(path: string, listener: (event: IFileSystemEvent) => void): void;
    /**
     * Check if path is directory
     */
    isDirectory(path: string): Promise<boolean>;
    /**
     * Check if path is file
     */
    isFile(path: string): Promise<boolean>;
    /**
     * Get file size
     */
    getSize(path: string): Promise<number>;
    /**
     * Get file modification time
     */
    getModifiedTime(path: string): Promise<number>;
    /**
     * Dispose file service
     */
    dispose(): void;
}
export declare const tauriFileService: TauriFileService;
export {};
//# sourceMappingURL=TauriFileService.d.ts.map