/**
 * @module FileService
 * @description
 * Advanced file service implementation based on Microsoft patterns with Tauri integration.
 * Provides comprehensive file operations with advanced error handling and performance monitoring.
 *
 * Architecture:
 * - Microsoft-inspired service patterns with dependency injection
 * - Tauri-native file system integration
 * - Advanced error handling with graceful degradation
 * - Performance monitoring and optimization
 * - Comprehensive type safety
 *
 * Microsoft Source Reference: `vs/platform/files/common/files.ts`
 */
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
interface FileServiceInterface {
    /**
     * Reads a file from the file system.
     * Microsoft Pattern: readFile with comprehensive options
     */
    readonly ReadFile: (uri: Uri, options?: ReadFileOptions) => Effect.Effect<string, FileProblem>;
    /**
     * Writes content to a file.
     * Microsoft Pattern: writeFile with comprehensive options
     */
    readonly WriteFile: (uri: Uri, content: string, options?: WriteFileOptions) => Effect.Effect<void, FileProblem>;
    /**
     * Checks if a file or directory exists.
     * Microsoft Pattern: exists with comprehensive options
     */
    readonly Exists: (uri: Uri) => Effect.Effect<boolean, FileProblem>;
    /**
     * Creates a directory.
     * Microsoft Pattern: createDirectory with comprehensive options
     */
    readonly CreateDirectory: (uri: Uri, options?: CreateDirectoryOptions) => Effect.Effect<void, FileProblem>;
    /**
     * Deletes a file or directory.
     * Microsoft Pattern: delete with comprehensive options
     */
    readonly Delete: (uri: Uri, options?: DeleteOptions) => Effect.Effect<void, FileProblem>;
    /**
     * Copies a file or directory.
     * Microsoft Pattern: copy with comprehensive options
     */
    readonly Copy: (source: Uri, target: Uri, options?: CopyOptions) => Effect.Effect<void, FileProblem>;
    /**
     * Moves a file or directory.
     * Microsoft Pattern: move with comprehensive options
     */
    readonly Move: (source: Uri, target: Uri, options?: MoveOptions) => Effect.Effect<void, FileProblem>;
}
interface ReadFileOptions {
    encoding?: string;
    position?: number;
    length?: number;
}
interface WriteFileOptions {
    encoding?: string;
    create?: boolean;
    overwrite?: boolean;
}
interface CreateDirectoryOptions {
    recursive?: boolean;
}
interface DeleteOptions {
    recursive?: boolean;
    useTrash?: boolean;
}
interface CopyOptions {
    overwrite?: boolean;
}
interface MoveOptions {
    overwrite?: boolean;
}
interface Uri {
    fsPath: string;
    toString(): string;
}
declare class FileProblem extends Error {
    readonly context: string;
    readonly cause?: Error | undefined;
    readonly recoverable: boolean;
    readonly suggestion?: string | undefined;
    constructor(context: string, cause?: Error | undefined, recoverable?: boolean, suggestion?: string | undefined);
    static CreatePermissionError(cause: Error): FileProblem;
    static CreateNotFoundError(cause: Error): FileProblem;
    static CreateValidationError(message: string): FileProblem;
    static CreateNetworkError(cause: Error): FileProblem;
}
declare const FileService_base: Effect.Service.Class<FileServiceInterface, "Service/File", {
    readonly effect: Effect.Effect<{
        ReadFile: (uri: Uri, options?: ReadFileOptions) => Effect.Effect<string, FileProblem, never>;
        WriteFile: (uri: Uri, content: string, options?: WriteFileOptions) => Effect.Effect<void, FileProblem, never>;
        Exists: (uri: Uri) => Effect.Effect<boolean, FileProblem, never>;
        CreateDirectory: (uri: Uri, options?: CreateDirectoryOptions) => Effect.Effect<void, FileProblem, never>;
        Delete: (uri: Uri, options?: DeleteOptions) => Effect.Effect<void, FileProblem, never>;
        Copy: (source: Uri, target: Uri, options?: CopyOptions) => Effect.Effect<void, FileProblem, never>;
        Move: (source: Uri, target: Uri, options?: MoveOptions) => Effect.Effect<void, FileProblem, never>;
    }, never, never>;
}>;
declare class FileService extends FileService_base {
}
export declare const ProvideFile: Layer.Layer<FileService, never, never>;
export declare const FileServiceTag: typeof FileService;
export declare class FilePerformanceMonitor {
    private static metrics;
    static trackOperation(operation: string, duration: number, bytes: number): void;
    static getMetrics(): {
        readFileTime: number;
        writeFileTime: number;
        existsCheckTime: number;
        createDirectoryTime: number;
        deleteTime: number;
        copyTime: number;
        moveTime: number;
        errorRate: number;
        successRate: number;
    };
}
export default FileService;
//# sourceMappingURL=FileService.d.ts.map