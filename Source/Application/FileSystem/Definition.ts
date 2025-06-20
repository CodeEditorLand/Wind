

/**
 * @module Definition (FileSystem/Application)
 * @description The concrete implementation of the IFileSystemProvider interface, which
 * adapts our Tauri integration Effects to the API expected by the IFileService.
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

import {
	Delete,
	Mkdir,
	Readdir,
	ReadFile,
	Rename,
	Stat,
	Unwatch,
	Watch,
	WriteFile,
} from "../../../Integration/Tauri/Wrapper.js";
import { type Uri } from "../../../Platform/VSCode/Type.js";

class FileSystemProviderImpl implements IFileSystemProvider {
	private WatchCorrelationId = 0;
	private readonly _onDidChangeFile = new Emitter<readonly IFileChange[]>();

	// --- IFileSystemProvider Implementation ---

	readonly capabilities: FileSystemProviderCapabilities =
		FileSystemProviderCapabilities.FileReadWrite |
		FileSystemProviderCapabilities.PathCaseSensitive;

	readonly onDidChangeCapabilities: Event<void> = Event.None;
	readonly onDidChangeFile: Event<readonly IFileChange[]> =
		this._onDidChangeFile.event;

	private run = <A, E extends FileSystemProviderError>(
		effect: Effect.Effect<A, E>,
	) => Runtime.runPromise(Runtime.defaultRuntime, effect);

	stat = (resource: Uri): Promise<IStat> => this.run(Stat(resource));
	readdir = (
		resource: Uri,
	): Promise<
		[string, import("vs/platform/files/common/files.js").FileType][]
	> => this.run(Readdir(resource));
	mkdir = (resource: Uri): Promise<void> => this.run(Mkdir(resource));
	readFile = (resource: Uri): Promise<Uint8Array> =>
		this.run(ReadFile(resource));
	writeFile = (
		resource: Uri,
		content: Uint8Array,
		opts: IFileWriteOptions,
	): Promise<void> => this.run(WriteFile(resource, content, opts));
	delete = (resource: Uri, opts: IFileDeleteOptions): Promise<void> =>
		this.run(Delete(resource, opts));
	rename = (from: Uri, to: Uri, opts: IFileOverwriteOptions): Promise<void> =>
		this.run(Rename(from, to, opts));

	watch = (resource: Uri, opts: IWatchOptions): IDisposable => {
		const CorrelationId = this.WatchCorrelationId++;
		// The watch effect is a long-running process, so we fork it.
		Effect.runFork(Watch(resource, { ...opts, correlationId }));
		// Return a disposable that will stop the watch.
		return {
			dispose: () => Effect.runFork(Unwatch(CorrelationId)),
		};
	};
}

/**
 * An Effect that creates an instance of the FileSystemProvider.
 */
const Definition = Effect.sync(() => new FileSystemProviderImpl());

export default Definition;
