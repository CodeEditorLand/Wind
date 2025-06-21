/**
 * @module Definition (File)
 * @description The live implementation of the IFileService.
 */

import { Effect } from "effect";
import { Schemas } from "vs/base/common/network.js";
import { FileService } from "vs/platform/files/common/fileService.js";

import { Log } from "../Log.js";
import type { Interface } from "./Service.js";

/**
 * An Effect that builds the live implementation of the File service.
 *
 * This implementation uses the `FileService` class from VS Code's platform code,
 * which provides a rich set of features like eventing and capabilities management.
 * We provide it with our own `TauriDiskFileSystemProvider` (from the FileSystem
 * module) to connect it to our native backend.
 */
const Definition = Effect.gen(function* (_) {
	const LogService = yield* _(Log.Tag);
	const FileSystemProviderInstance = yield* _(FileSystemProvider.Tag);

	// The FileService class is the canonical implementation.
	const ServiceInstance = new FileService(LogService);

	// Register our custom provider for the 'file' scheme.
	ServiceInstance.registerProvider(Schemas.file, FileSystemProviderInstance);

	// A real implementation would also register providers for other schemes
	// like 'vscode-remote', 'untitled', etc., as needed.

	return ServiceInstance;
});

export default Definition;
