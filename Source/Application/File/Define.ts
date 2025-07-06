/**
 * @module Define
 * @description
 * Defines the service interface and live implementation for the `IFileService`
 * from VS Code. This service orchestrates file operations by delegating to
 * registered filesystem providers.
 */

import { Schemas } from "@codeeditorland/output/vs/base/common/network.js";
import {
	type IFileService,
	type IFileSystemProvider,
} from "@codeeditorland/output/vs/platform/files/common/files.js";
import { FileService as VSCodeFileService } from "@codeeditorland/output/vs/platform/files/common/fileService.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { Effect } from "effect";

import { FileSystemService } from "../FileSystem/Define.js";

/**
 * The `Effect.Service` for the `IFileService`.
 *
 * This service is the main entry point for file-related operations in the
 * workbench. The implementation "lifts" the original `FileService` class from
 * VS Code, providing it with our Effect-native services (`ILogService` and
 * our custom `FileSystemService`) that it depends on. This allows us to use the
 * battle-tested VS Code implementation while managing its dependencies via Effect.
 *
 * It is registered with the identifier "fileService" for compatibility.
 */
export class FileService extends Effect.Service<IFileService>()("fileService", {
	effect: Effect.gen(function* (Generator) {
		const LoggerService = yield* Generator(ILogService);
		const FileSystemProvider = yield* Generator(FileSystemService);

		// Instantiate the real VS Code FileService.
		const ServiceInstance = new VSCodeFileService(LoggerService);

		// Register our custom FileSystem service as the provider for the 'file'
		// scheme. This is the critical integration point that directs all
		// local file operations to our host-proxied implementation.
		ServiceInstance.registerProvider(
			Schemas.file,
			FileSystemProvider as IFileSystemProvider,
		);

		// A full implementation would also register providers for other schemes
		// such as 'vscode-remote', 'untitled', etc., as needed.

		return ServiceInstance;
	}),
}) {}
