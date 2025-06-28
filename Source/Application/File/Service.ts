/**
 * @module Service (Application/File)
 * @description Defines the service interface and live implementation for the
 * `IFileService` from VS Code. This service orchestrates file operations by
 * delegating to registered filesystem providers.
 */

import { Effect } from "effect";
import { Schemas } from "vs/base/common/network.js";
import { FileService as VSCodeFileService } from "vs/platform/files/common/fileService.js";
import type { IFileService } from "vs/platform/files/common/files.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { FileSystemProviderService } from "Source/Application/FileSystem/Service.js";

/**
 * The `Effect.Service` for the `IFileService`.
 *
 * This service is the main entry point for file-related operations in the
 * workbench. The implementation "lifts" the original `FileService` class from
 * VS Code, providing it with our Effect-native services (`ILogService` and
 * `FileSystemProviderService`) that it depends on. This allows us to use the
 * battle-tested VS Code implementation while managing its dependencies via Effect.
 */
export class FileService extends Effect.Service<IFileService>()(
	"vscode/FileService",
	{
		effect: Effect.gen(function* (Generator) {
			const LogService = yield* Generator(ILogService);
			const FileSystemProvider = yield* Generator(
				FileSystemProviderService,
			);

			// Instantiate the real VS Code FileService.
			const ServiceInstance = new VSCodeFileService(LogService);

			// Register our custom provider for the 'file' scheme, which bridges
			// to the Tauri backend. This is a critical integration point.
			ServiceInstance.registerProvider(Schemas.file, FileSystemProvider);

			// A full implementation would also register providers for other schemes
			// like 'vscode-remote', 'untitled', etc., as needed.

			return ServiceInstance;
		}),
	},
) {}
