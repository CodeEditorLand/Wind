/**
 * @module Define
 * @description
 * Defines the service that implements the `vscode.workspace.fs` API,
 * proxying all filesystem operations to the native host process via the
 * `HostService`.
 */

import { Effect } from "effect";
import type { FileStat, FileSystem as VSCodeFileSystem } from "vscode";

import type { Uri } from "../../Platform/Vscode/Type.js";
import { HostService } from "../Host/Define.js";
import { FileSystemProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `vscode.workspace.fs` API.
 *
 * This service implementation proxies all filesystem operations to the native
 * host (`Mountain`) via the `HostService`. This ensures that all file I/O is
 * handled by the backend, respecting the application's sandboxing model and
 * providing access to the user's filesystem.
 *
 * It is registered with the identifier "vscode/FileSystem" for compatibility.
 */
export class FileSystemService extends Effect.Service<VSCodeFileSystem>()(
	"vscode/FileSystem",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);

			/**
			 * A factory for creating a proxied `Effect` for a given filesystem operation.
			 * It abstracts the pattern of calling a `HostService` method and mapping
			 * the potential `HostProblem` to a `FileSystemProblem`.
			 */
			const CreateProxyEffect = <T, Arguments extends any[]>(
				Method: keyof typeof Host,
				Context: string,
			) => {
				return (
					...Arguments: Arguments
				): Effect.Effect<T, FileSystemProblem> =>
					(Host[Method] as any)(...Arguments).pipe(
						Effect.mapError(
							(Cause: any) =>
								new FileSystemProblem({ Cause, Context }),
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
			const WriteFileEffect = CreateProxyEffect<
				void,
				[Uri, Uint8Array, any]
			>("WriteFile", "WriteFileFailed");
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

			/**
			 * The concrete implementation of the `vscode.FileSystem` interface.
			 * Each method bridges the promise-based API to our Effect-based implementation.
			 */
			const ServiceImplementation: VSCodeFileSystem = {
				stat: (Uri) => Effect.runPromise(StatEffect(Uri)),
				readDirectory: (Uri) =>
					Effect.runPromise(ReadDirectoryEffect(Uri)),
				createDirectory: (Uri) =>
					Effect.runPromise(CreateDirectoryEffect(Uri)),
				readFile: (Uri) => Effect.runPromise(ReadFileEffect(Uri)),
				writeFile: (Uri, Content, Options) =>
					Effect.runPromise(WriteFileEffect(Uri, Content, Options)),
				delete: (Uri, Options) =>
					Effect.runPromise(DeleteEffect(Uri, Options)),
				rename: (Source, Target, Options) =>
					Effect.runPromise(RenameEffect(Source, Target, Options)),
				copy: (Source, Target, Options) =>
					Effect.runPromise(CopyEffect(Source, Target, Options)),
				isWritableFileSystem: (_Scheme) => true, // Assume all proxied filesystems are writable.
			};

			return ServiceImplementation;
		}),
	},
) {}
