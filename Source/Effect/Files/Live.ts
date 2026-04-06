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
 */

import { Effect, Layer } from "effect";

import { IPC } from "../IPC.js";
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

export const LiveFilesServiceLayer = Layer.effect(
	FilesServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: FilesService = {
			ReadFile: (uri) => {
				const Path = UriToPath(uri);
				return IPCService.invoke("file:read")([Path]).pipe(
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
				return IPCService.invoke("file:write")([
					Path,
					Array.from(content),
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeFilesProblem),
				);
			},

			Stat: (uri) => {
				const Path = UriToPath(uri);
				return IPCService.invoke("file:stat")([Path]).pipe(
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
							type:
								Metadata.type ?? (Metadata.isDirectory ? 2 : 1),
							size: Metadata.size ?? 0,
							mtime: Metadata.mtime ?? 0,
						};
					}),
					Effect.mapError(MakeFilesProblem),
				);
			},

			ReadDir: (uri) => {
				const Path = UriToPath(uri);
				return IPCService.invoke("file:readdir")([Path]).pipe(
					Effect.map((Result) => {
						if (!Array.isArray(Result)) return [];
						// Result is an array of [name, type] tuples or plain names
						return (Result as unknown[]).map(
							(Entry): [string, number] => {
								if (Array.isArray(Entry)) {
									const [Name, Type] = Entry as [
										string,
										number,
									];
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
				return IPCService.invoke("file:mkdir")([Path]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeFilesProblem),
				);
			},

			Delete: (uri, options) => {
				const Path = UriToPath(uri);
				return IPCService.invoke("file:delete")([
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
				return IPCService.invoke("file:move")([
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
				return IPCService.invoke("file:copy")([
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
				return IPCService.invoke("file:exists")([Path]).pipe(
					Effect.map((Result) => Boolean(Result)),
					Effect.mapError(MakeFilesProblem),
				);
			},

			Watch: (uri) => {
				// Watch registration is fire-and-forget for now.
				// Mountain's CocoonService.watch_file stores the intent.
				const Path = UriToPath(uri);
				return IPCService.invoke("file:read")([Path]) // Verify path exists
					.pipe(
						Effect.map(() => ({
							dispose: () => {
								// No-op until notify crate integration is complete
							},
						})),
						Effect.mapError(MakeFilesProblem),
					);
			},

			ShowOpenDialog: (Options) =>
				IPCService.invoke("UserInterface.ShowOpenDialog")([
					Options ?? {},
				]).pipe(
					Effect.map((Result) =>
						Array.isArray(Result) ? (Result as string[]) : [],
					),
					Effect.mapError(MakeFilesProblem),
				),

			ShowSaveDialog: (Options) =>
				IPCService.invoke("UserInterface.ShowSaveDialog")([
					Options ?? {},
				]).pipe(
					Effect.map((Result) =>
						typeof Result === "string" ? Result : undefined,
					),
					Effect.mapError(MakeFilesProblem),
				),
		};

		return Service;
	}),
);

export default LiveFilesServiceLayer;
