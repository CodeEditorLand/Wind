/**
 * @module Bootstrap/Integration/Services/FileService
 * @description
 * File operations service following VSCode IFileService interface with Tauri integration.
 *
 * Features:
 * - Tauri fs integration: @tauri-apps/plugin-fs
 * - Operations: readFile, writeFile, exists, stat, mkdir, delete, readdir, copy, move
 * - File watch via Tauri watch() API
 * - URI mapping to OS paths
 * - Effect-TS wrappers for all operations
 * - Comprehensive error handling
 *
 * VSCode IFileService Methods:
 * - readFile(uri): Promise<Uint8Array>
 * - writeFile(uri, content): Promise<void>
 * - exists(uri): Promise<boolean>
 * - stat(uri): Promise<IFileStat>
 * - mkdir(uri): Promise<void>
 * - delete(uri): Promise<void>
 * - readdir(uri): Promise<[string, FileType][]>
 * - createFile(uri)
 * - createFolder(uri)
 * - move(source, target)
 * - copy(source, target)
 */
import * as Effect from "effect/Effect";
/**
 * File statistics
 */
export interface FileStat {
    /** Is this a file? */
    isFile: boolean;
    /** Is this a directory? */
    isDirectory: boolean;
    /** Is this a symbolic link? */
    isSymlink?: boolean;
    /** File size in bytes */
    size: number;
    /** Last modified time (timestamp) */
    modified: number;
    /** Last accessed time (timestamp) */
    accessed?: number;
    /** Created time (timestamp) */
    created?: number;
}
/**
 * Directory entry
 */
export interface DirEntry {
    /** Entry name */
    name: string;
    /** Is this a file? */
    isFile: boolean;
    /** Is this a directory? */
    isDirectory: boolean;
    /** Is this a symbolic link? */
    isSymlink?: boolean;
}
/**
 * FileType enum for readdir
 */
export declare enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 64
}
/**
 * File service interface following VSCode IFileService
 */
export interface FileService {
    /**
     * Read file content as string
     * @param path - File path (absolute or relative to home)
     */
    readFile: (path: string) => Effect.Effect<string>;
    /**
     * Write file content
     * @param path - File path
     * @param content - Content to write
     */
    writeFile: (path: string, content: string) => Effect.Effect<void>;
    /**
     * Check if file/directory exists
     */
    exists: (path: string) => Effect.Effect<boolean>;
    /**
     * Get file statistics
     */
    stat: (path: string) => Effect.Effect<FileStat>;
    /**
     * Create directory (recursive by default)
     */
    mkdir: (path: string) => Effect.Effect<void>;
    /**
     * Delete file/directory (recursive by default)
     */
    delete: (path: string) => Effect.Effect<void>;
    /**
     * Read directory contents
     */
    readdir: (path: string) => Effect.Effect<DirEntry[]>;
    /**
     * Copy file/directory
     */
    copy: (source: string, destination: string) => Effect.Effect<void>;
    /**
     * Move/rename file/directory
     */
    move: (source: string, destination: string) => Effect.Effect<void>;
    /**
     * Watch file/directory for changes
     * @returns cleanup function to stop watching
     */
    watch: (path: string, callback: () => void) => Effect.Effect<() => void>;
    /**
     * Convert URI to OS path
     */
    uriToPath: (uri: string) => string;
    /**
     * Convert OS path to URI
     */
    pathToUri: (path: string) => string;
    /**
     * Read file as binary data (Uint8Array)
     */
    readBinaryFile: (path: string) => Effect.Effect<Uint8Array>;
    /**
     * Write binary data (Uint8Array)
     */
    writeBinaryFile: (path: string, content: Uint8Array) => Effect.Effect<void>;
}
export declare const FileServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, FileService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the file service layer
 * @returns Effect-TS layer for FileService
 */
export declare function createFileServiceLayer(): Effect.Layer<never>;
/**
 * Effect wrapper for reading file
 */
export declare const readFileEffect: (path: string) => Effect.Effect<string>;
/**
 * Effect wrapper for writing file
 */
export declare const writeFileEffect: (path: string, content: string) => Effect.Effect<void>;
/**
 * Effect wrapper for checking if path exists
 */
export declare const existsEffect: (path: string) => Effect.Effect<boolean>;
/**
 * Effect wrapper for getting file stats
 */
export declare const statEffect: (path: string) => Effect.Effect<FileStat>;
/**
 * Effect wrapper for creating directory
 */
export declare const mkdirEffect: (path: string) => Effect.Effect<void>;
/**
 * Effect wrapper for deleting file/directory
 */
export declare const deleteEffect: (path: string) => Effect.Effect<void>;
/**
 * Effect wrapper for reading directory
 */
export declare const readdirEffect: (path: string) => Effect.Effect<DirEntry[]>;
/**
 * Effect wrapper for copying file
 */
export declare const copyEffect: (source: string, destination: string) => Effect.Effect<void>;
/**
 * Effect wrapper for moving file
 */
export declare const moveEffect: (source: string, destination: string) => Effect.Effect<void>;
/**
 * Effect wrapper for watching file/directory
 */
export declare const watchEffect: (path: string, callback: () => void) => Effect.Effect<() => void>;
export default FileServiceTag;
//# sourceMappingURL=FileService.d.ts.map