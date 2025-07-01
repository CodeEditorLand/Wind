/**
 * @module Service (Application/File)
 * @description Defines the service interface and live implementation for the
 * `IFileService` from VS Code. This service orchestrates file operations by
 * delegating to registered filesystem providers.
 */
import { Effect } from "effect";

declare const FileService_base: Effect.Service.Class<
	IFileService,
	"vscode/FileService",
	{
		readonly effect: Effect.Effect<any, unknown, unknown>;
	}
>;
/**
 * The `Effect.Service` for the `IFileService`.
 *
 * This service is the main entry point for file-related operations in the
 * workbench. The implementation "lifts" the original `FileService` class from
 * VS Code, providing it with our Effect-native services (`ILogService` and
 * `FileSystemService`) that it depends on. This allows us to use the
 * battle-tested VS Code implementation while managing its dependencies via Effect.
 */
export declare class FileService extends FileService_base {}
export {};
