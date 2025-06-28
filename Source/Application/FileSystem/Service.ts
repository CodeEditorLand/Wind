/**
 * @module Service (Application/FileSystem)
 * @description Defines the service that implements the `IFileSystemProvider`
 * interface. This service adapts our Tauri integration Effects to the API
 * expected by the `IFileService`.
 */

import { Effect, Runtime } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import { type IDisposable } from "vs/base/common/lifecycle.js";
import {
	FileSystemProviderCapabilities,
	type FileSystemProviderError,
	type IFileChange,
	type IFileDeleteOptions,
	type IFileOverwriteOptions,
	type IFileSystemProvider,
	type IFileWriteOptions,
	type IStat,
	type IWatchOptions,
} from "vs/platform/files/common/files.js";

import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import {
	Delete,
	MakeDirectory,
	ReadDirectory,
	ReadFile,
	Rename,
	Stat,
	Unwatch,
	Watch,
	WriteFile,
} from "Source/Integration/Tauri/Wrapper.js";
import type { Uri } from "Source/Platform/VSCode/Type.js";

/**
 * The `Effect.Service` for the `IFileSystemProvider`.
 *
 * This service provides a concrete implementation that bridges VS Code's file
 * service architecture to our Tauri backend. Each method (`stat`, `readFile`, etc.)
 * wraps a specific integration `Effect` and executes it, returning a `Promise`
 * to satisfy the `IFileSystemProvider` interface.
 */
export class FileSystemProviderService extends Effect.Service<IFileSystemProvider>()(
	"wind/FileSystemProviderService",
	{
		effect: Effect.gen(function* (Generator) {
			const AppRuntime = yield* Generator(Effect.runtime<never>());

			const RunEffect = <A, E extends FileSystemProviderError>(
				EffectToRun: Effect.Effect<A, E>,
			): Promise<A> => Runtime.runPromise(AppRuntime, EffectToRun);

			const WatchCorrelationId = { current: 0 };
			const OnDidChangeFileEmitter = new Emitter<
				readonly IFileChange[]
			>();

			const ServiceImplementation: IFileSystemProvider = {
				capabilities:
					FileSystemProviderCapabilities.FileReadWrite |
					FileSystemProviderCapabilities.PathCaseSensitive,

				onDidChangeCapabilities: Event.None,
				onDidChangeFile: OnDidChangeFileEmitter.event,

				stat: (Resource: Uri): Promise<IStat> =>
					RunEffect(Stat(Resource)),
				readdir: (
					Resource: Uri,
				): Promise<
					[
						string,
						import("vs/platform/files/common/files.js").FileType,
					][]
				> => RunEffect(ReadDirectory(Resource)),

				mkdir: (Resource: Uri): Promise<void> =>
					RunEffect(MakeDirectory(Resource)),

				readFile: (Resource: Uri): Promise<Uint8Array> =>
					RunEffect(ReadFile(Resource)),

				writeFile: (
					Resource: Uri,
					Content: Uint8Array,
					Options: IFileWriteOptions,
				): Promise<void> =>
					RunEffect(WriteFile(Resource, Content, Options)),

				delete: (
					Resource: Uri,
					Options: IFileDeleteOptions,
				): Promise<void> => RunEffect(Delete(Resource, Options)),

				rename: (
					From: Uri,
					To: Uri,
					Options: IFileOverwriteOptions,
				): Promise<void> => RunEffect(Rename(From, To, Options)),

				watch: (Resource: Uri, Options: IWatchOptions): IDisposable => {
					const CorrelationId = WatchCorrelationId.current++;

					// The watch effect is a long-running process, so we fork it.
					Effect.runFork(
						Watch(Resource, {
							...Options,
							correlationId: CorrelationId,
						}),
					);

					// Return a disposable that will stop the watch.
					return {
						dispose: () => Effect.runFork(Unwatch(CorrelationId)),
					};
				},
			};

			return ServiceImplementation;
		}),
	},
) {}
