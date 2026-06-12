/**
 * @module Effect/Files/Live
 * @description
 * Live implementation of FilesService backed by Mountain's FileSystem
 * providers via Tauri IPC.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   file:read       → ReadFile(path)
 *   file:write      → WriteFile(path, content)
 *   file:stat       → Stat(path)
 *   file:readdir    → Readdir(path)
 *   file:mkdir      → Mkdir(path)
 *   file:delete     → Delete(path, { recursive? })
 *   file:move       → Move(source, target, { overwrite? })
 *   file:copy       → Copy(source, target, { overwrite? })
 *   file:exists     → Exists(path)
 *   file:watch      → Watch(path)
 *   file:unwatch    → Unwatch(path)
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";

import { TauriIPCLive } from "../IPC/index.js";

import type { FilesService } from "./Interface/FilesService.js";

import { FilesServiceTag } from "./Tag/FilesServiceTag.js";

import type { FilesProblem } from "./Type/FilesProblem.js";

const MakeFilesProblem = (error: unknown): FilesProblem =>
	error instanceof Error
		? { _tag: "FilesOperationFailed", error }

		: { _tag: "FilesOperationFailed", error: new Error(String(error)) };

/** Strip the `file://` scheme from a URI to get a plain filesystem path. */
const UriToPath = (uri: string): string =>
	uri.startsWith("file://") ? uri.slice("file://".length) : uri;

function makeFilesService(): FilesService {

	const IPCService = TauriIPCLive;

	const Service: FilesService = {
		ReadFile: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileRead)([Path]).pipe(
				Effect.map((Result) => {
					if (Result instanceof Uint8Array) return Result;

					if (typeof Result === "string")

						return new TextEncoder().encode(Result);

					if (Array.isArray(Result))

						return new Uint8Array(Result as number[]);

					return new Uint8Array();
				}),

				Effect.mapError(MakeFilesProblem),
			);
		},

		WriteFile: (uri, content) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileWrite)([
				Path,

				Array.from(content),
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Stat: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileStat)([Path]).pipe(
				Effect.map((Result) => {
					const Metadata = Result as {
						type?: number;

						isFile?: boolean;

						isDirectory?: boolean;

						size?: number;

						mtime?: number;
					};

					return {
						// VS Code FileType: 0=Unknown 1=File 2=Directory 64=SymbolicLink
						type: Metadata.type ?? (Metadata.isDirectory ? 2 : 1),
						size: Metadata.size ?? 0,
						mtime: Metadata.mtime ?? 0,
					};
				}),

				Effect.mapError(MakeFilesProblem),
			);
		},

		ReadDir: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileReaddir)([Path]).pipe(
				Effect.map((Result) => {
					if (!Array.isArray(Result)) return [];

					// Result is an array of [name, type] tuples or plain names
					return (Result as unknown[]).map(
						(Entry): [string, number] => {
							if (Array.isArray(Entry)) {
								const [Name, Type] = Entry as [string, number];

								return [Name, Type ?? 0];
							}

							return [String(Entry), 0];
						},
					);
				}),

				Effect.mapError(MakeFilesProblem),
			);
		},

		CreateDirectory: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileMkdir)([Path]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Delete: (uri, options) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileDelete)([
				Path,

				options ?? {},
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Rename: (source, target, options) => {
			const SourcePath = UriToPath(source);

			const TargetPath = UriToPath(target);

			return IPCService.invoke(Channel.FileMove)([
				SourcePath,

				TargetPath,

				options ?? {},
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Copy: (source, target, options) => {
			const SourcePath = UriToPath(source);

			const TargetPath = UriToPath(target);

			return IPCService.invoke(Channel.FileCopy)([
				SourcePath,

				TargetPath,

				options ?? {},
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Exists: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileExists)([Path]).pipe(
				Effect.map((Result) => Boolean(Result)),

				Effect.mapError(MakeFilesProblem),
			);
		},

		Watch: (uri) => {
			const Path = UriToPath(uri);

			return IPCService.invoke(Channel.FileWatch)([Path]).pipe(
				Effect.map(() => ({
					dispose: () => {
						void Effect.runFork(
							IPCService.invoke(Channel.FileUnwatch)([Path]).pipe(
								Effect.catchAll(() => Effect.void),
							),
						);
					},
				})),

				Effect.mapError(MakeFilesProblem),
			);
		},

		// `UserInterface.ShowOpenDialog` / `…ShowSaveDialog` use dotted
		// names inherited from the Cocoon→Mountain gRPC surface. Wave 5
		// added them to the Channel registry (tail group with a
		// rename-path comment pointing at `dialog:showOpen` /
		// `dialog:showSave`). The Mountain-side handler rename is a
		// coordinated follow-up; until then the wire strings stay
		// dotted on both ends and the registry is the single source of
		// truth for the spelling.
		ShowOpenDialog: (Options) =>
			IPCService.invoke(Channel.UserInterfaceShowOpenDialog)([
				Options ?? {},
			]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as string[]) : [],
				),

				Effect.mapError(MakeFilesProblem),
			),

		ShowSaveDialog: (Options) =>
			IPCService.invoke(Channel.UserInterfaceShowSaveDialog)([
				Options ?? {},
			]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : undefined,
				),

				Effect.mapError(MakeFilesProblem),
			),
	};

	return Service;
}

export const LiveFilesServiceLayer = Layer.succeed(
	FilesServiceTag,

	makeFilesService(),
);

export default LiveFilesServiceLayer;
