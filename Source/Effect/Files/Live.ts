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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { FilesService } from "./Interface/FilesService.js";
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
		ReadFile: async (uri) => {
			const Path = UriToPath(uri);

			const Result = await IPCService.invoke(Channel.FileRead)([Path]);

			if (Result instanceof Uint8Array) return Result;

			if (typeof Result === "string")
				return new TextEncoder().encode(Result);

			if (Array.isArray(Result))
				return new Uint8Array(Result as number[]);

			return new Uint8Array();
		},

		WriteFile: async (uri, content) => {
			const Path = UriToPath(uri);

			await IPCService.invoke(Channel.FileWrite)([
				Path,

				Array.from(content),
			]);
		},

		Stat: async (uri) => {
			const Path = UriToPath(uri);

			const Result = await IPCService.invoke(Channel.FileStat)([Path]);

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
		},

		ReadDir: async (uri) => {
			const Path = UriToPath(uri);

			const Result = await IPCService.invoke(Channel.FileReaddir)([Path]);

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
		},

		CreateDirectory: async (uri) => {
			const Path = UriToPath(uri);

			await IPCService.invoke(Channel.FileMkdir)([Path]);
		},

		Delete: async (uri, options) => {
			const Path = UriToPath(uri);

			await IPCService.invoke(Channel.FileDelete)([
				Path,

				options ?? {},
			]);
		},

		Rename: async (source, target, options) => {
			const SourcePath = UriToPath(source);

			const TargetPath = UriToPath(target);

			await IPCService.invoke(Channel.FileMove)([
				SourcePath,

				TargetPath,

				options ?? {},
			]);
		},

		Copy: async (source, target, options) => {
			const SourcePath = UriToPath(source);

			const TargetPath = UriToPath(target);

			await IPCService.invoke(Channel.FileCopy)([
				SourcePath,

				TargetPath,

				options ?? {},
			]);
		},

		Exists: async (uri) => {
			const Path = UriToPath(uri);

			const Result = await IPCService.invoke(Channel.FileExists)([Path]);

			return Boolean(Result);
		},

		Watch: async (uri) => {
			const Path = UriToPath(uri);

			await IPCService.invoke(Channel.FileWatch)([Path]);

			return {
				dispose: () => {
					IPCService.invoke(Channel.FileUnwatch)([Path]).catch(() => {});
				},
			};
		},

		ShowOpenDialog: async (Options) => {
			const Result = await IPCService.invoke(Channel.UserInterfaceShowOpenDialog)([
				Options ?? {},
			]);

			return Array.isArray(Result) ? (Result as string[]) : [];
		},

		ShowSaveDialog: async (Options) => {
			const Result = await IPCService.invoke(Channel.UserInterfaceShowSaveDialog)([
				Options ?? {},
			]);

			return typeof Result === "string" ? Result : undefined;
		},
	};

	return Service;
}

export const LiveFilesService = makeFilesService();

export default LiveFilesService;
