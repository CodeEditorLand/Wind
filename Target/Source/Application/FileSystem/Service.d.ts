/**
 * @module Service (Application/FileSystem)
 * @description Defines the service that implements the `vscode.workspace.fs` API,
 * proxying filesystem operations to the host process.
 */
import { Effect } from "effect";
declare const FileSystemService_base: Effect.Service.Class<VSCodeFileSystem, "vscode/FileSystem", {
    readonly effect: Effect.Effect<VSCodeFileSystem, never, import("../Host/Service.js").Host>;
}>;
/**
 * The `Effect.Service` for the `vscode.workspace.fs` API.
 *
 * This service implementation proxies all filesystem operations to the native
 * host (`Mountain`) via the `HostService`. This ensures that all file I/O is
 * handled by the backend, respecting the application's sandboxing model.
 */
export declare class FileSystemService extends FileSystemService_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map