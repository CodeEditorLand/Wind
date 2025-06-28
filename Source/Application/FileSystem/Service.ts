/**
 * @module Service (Application/FileSystem)
 * @description Defines the service that implements the `vscode.workspace.fs` API,
 * proxying filesystem operations to the host process.
 */

import { Effect } from "effect";
import {
	type Event,
	type FileChangeEvent,
	type FileStat,
	type FileSystem as VSCodeFileSystem,
	type FileSystemProvider,
	type FileSystemProviderCapabilitiesChangeEvent,
	type FileSystemProviderError,
	type FileSystemProviderWithFileReadWriteCapability,
	type FileSystemProviderWithOpenReadWriteCloseCapability,
	type TextSearchComplete,
	type TextSearchOptions,
	type TextSearchQuery,
	type Uri,
} from "vscode";
import { HostService } from "Source/Application/Host/Service.js";
import { FileSystemProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `vscode.workspace.fs` API.
 *
 * This service implementation proxies all filesystem operations to the native
 * host (`Mountain`) via the `HostService`. This ensures that all file I/O is
 * handled by the backend, respecting the application's sandboxing model.
 */
export class FileSystemService extends Effect.Service<VSCodeFileSystem>()(
	"vscode/FileSystem",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);

			// --- Helper to create a proxied Effect for a given operation ---
			const CreateProxyEffect = <T, Args extends any[]>(
				Method: keyof HostService,
				Context: string,
			) => {
				return (
					...Arguments: Args
				): Effect.Effect<T, FileSystemProblem> =>
					(Host[Method] as any)(...Arguments).pipe(
						Effect.mapError(
							(Cause) =>
								new FileSystemProblem({
									Cause,
									Context,
								}),
						),
					) as Effect.Effect<T, FileSystemProblem>;
			};

			const StatEffect = CreateProxyEffect<FileStat, [Uri]>(
				"Stat",
				"StatFailed",
			);
			const ReadDirectoryEffect = CreateProxyEffect<
				[string, any][],
				[Uri]
			>("ReadDirectory", "ReadDirectoryFailed");
			const CreateDirectoryEffect = CreateProxyEffect<void, [Uri]>(
				"CreateDirectory",
				"CreateDirectoryFailed",
			);
			const ReadFileEffect = CreateProxyEffect<Uint8Array, [Uri]>(
				"ReadFile",
				"ReadFileFailed",
			);
			const WriteFileEffect = CreateProxyEffect<void, [Uri, Uint8Array]>(
				"WriteFile",
				"WriteFileFailed",
			);
			const DeleteEffect = CreateProxyEffect<void, [Uri, any]>(
				"Delete",
				"DeleteFailed",
			);
			const RenameEffect = CreateProxyEffect<void, [Uri, Uri, any]>(
				"Rename",
				"RenameFailed",
			);
			const CopyEffect = CreateProxyEffect<void, [Uri, Uri, any]>(
				"Copy",
				"CopyFailed",
			);

			const ServiceImplementation: VSCodeFileSystem = {
				stat: (Uri) => Effect.runPromise(StatEffect(Uri)),
				readDirectory: (Uri) =>
					Effect.runPromise(ReadDirectoryEffect(Uri)),
				createDirectory: (Uri) =>
					Effect.runPromise(CreateDirectoryEffect(Uri)),
				readFile: (Uri) => Effect.runPromise(ReadFileEffect(Uri)),
				writeFile: (Uri, Content) =>
					Effect.runPromise(WriteFileEffect(Uri, Content)),
				delete: (Uri, Options) =>
					Effect.runPromise(DeleteEffect(Uri, Options)),
				rename: (Source, Target, Options) =>
					Effect.runPromise(RenameEffect(Source, Target, Options)),
				copy: (Source, Target, Options) =>
					Effect.runPromise(CopyEffect(Source, Target, Options)),
				isWritableFileSystem: (_Scheme) => true, // Assume all proxied are writable.
			};

			return ServiceImplementation;
		}),
	},
) {}
