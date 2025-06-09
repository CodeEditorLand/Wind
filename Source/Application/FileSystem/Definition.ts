/*
 * File: Wind/Source/Application/FileSystem/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:40 UTC
 * Dependency: effect, vs/base/common/event.js, vs/base/common/lifecycle.js, vs/base/common/uri.js
 */

import { Effect } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import { type IDisposable } from "vs/base/common/lifecycle.js";
import { type Uri } from "vs/base/common/uri.js";
import {
	FileSystemProviderCapabilities,
	FileType,
	type IFileDeleteOptions,
	type IFileOverwriteOptions,
	type IFileSystemProvider,
	type IFileWriteOptions,
	type IStat,
	type IWatchOptions,
} from "vs/platform/files/common/files";

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
} from "../../Integration/Tauri.js";

class TauriDiskFileSystemProvider implements IFileSystemProvider {
	readonly capabilities: FileSystemProviderCapabilities =
		FileSystemProviderCapabilities.FileReadWrite |
		FileSystemProviderCapabilities.PathCaseSensitive | // Assuming Linux/macOS sensitivity, backend should handle normalization
		FileSystemProviderCapabilities.FileFolderCopy;

	readonly onDidChangeCapabilities: Event<void> = Event.None;
	readonly onDidChangeFile: Event<any>;

	private readonly _onDidChangeFile = new Emitter<any>();
	private watchCorrelationId = 0;

	constructor() {
		this.onDidChangeFile = this._onDidChangeFile.event;
	}

	private run<A>(eff: Effect.Effect<A, any>): Promise<A> {
		return Effect.runPromise(eff);
	}

	// --- Metadata ---
	stat(resource: Uri): Promise<IStat> {
		return this.run(Stat(resource));
	}
	readdir(resource: Uri): Promise<[string, FileType][]> {
		return this.run(Readdir(resource));
	}
	mkdir(resource: Uri): Promise<void> {
		return this.run(Mkdir(resource));
	}

	// --- File I/O ---
	readFile(resource: Uri): Promise<Uint8Array> {
		return this.run(ReadFile(resource));
	}
	writeFile(
		resource: Uri,
		content: Uint8Array,
		opts: IFileWriteOptions,
	): Promise<void> {
		return this.run(WriteFile(resource, content, opts));
	}

	// --- File Operations ---
	delete(resource: Uri, opts: IFileDeleteOptions): Promise<void> {
		return this.run(Delete(resource, opts));
	}
	rename(from: Uri, to: Uri, opts: IFileOverwriteOptions): Promise<void> {
		return this.run(Rename(from, to, opts));
	}

	// --- Watching ---
	watch(resource: Uri, opts: IWatchOptions): IDisposable {
		const correlationId = this.watchCorrelationId++;
		const fullOpts = { ...opts, correlationId };

		// Start watching on the backend
		const startWatchEffect = Watch(resource, fullOpts);
		Effect.runFork(startWatchEffect);

		// The disposable to return to the caller
		const disposable: IDisposable = {
			dispose: () => {
				// Stop listening to backend events for this watcher
				// This requires an event listening mechanism that can be disposed.
				// Placeholder for now.

				// Tell the backend to stop watching
				Effect.runFork(Unwatch(correlationId));
			},
		};

		return disposable;
	}
}

const Definition = Effect.sync(() => new TauriDiskFileSystemProvider());
export default Definition;
