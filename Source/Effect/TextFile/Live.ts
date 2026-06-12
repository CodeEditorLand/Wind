/**
 * @module Effect/TextFile/Live
 * @description
 * Live implementation of TextFileService backed by Mountain's textFile IPC
 * channels. Reads and writes UTF-8 text files.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   textFile:read           → tokio::fs::read_to_string
 *   textFile:write          → tokio::fs::write
 *   textFile:save           → no-op dirty-state hint
 *   workingCopy:getAllDirty → list dirty URIs (drives SaveAll)
 *   workingCopy:isDirty     → per-URI dirty check
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { TextFileService } from "./Interface/TextFileService.js";
import type { TextFileProblem } from "./Type/TextFileProblem.js";

const UriToPath = (uri: string): string =>
	uri.startsWith("file://") ? uri.slice("file://".length) : uri;

const MakeTextFileProblem = (error: unknown): TextFileProblem =>
	error instanceof Error
		? { _tag: "TextFileOperationFailed", error }
		: { _tag: "TextFileOperationFailed", error: new Error(String(error)) };

function makeLiveTextFileService(): TextFileService {
	const IPCService = TauriIPCLive;

	const Service: TextFileService = {
		Read: async (uri) => {
			try {
				const Result = await IPCService.invoke(Channel.TextFileRead)([UriToPath(uri)]);
				return typeof Result === "string" ? Result : String(Result);
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},

		Write: async (uri, content) => {
			try {
				await IPCService.invoke(Channel.TextFileWrite)([UriToPath(uri), content]);
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},

		Save: async (uri) => {
			try {
				await IPCService.invoke(Channel.TextFileSave)([UriToPath(uri)]);
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},

		SaveAll: async () => {
			try {
				const Result = await IPCService.invoke(Channel.WorkingCopyGetAllDirty)([]);
				const DirtyUris = Array.isArray(Result) ? (Result as readonly string[]) : [];
				await Promise.all(
					DirtyUris.map((DirtyUri) =>
						IPCService.invoke(Channel.TextFileSave)([UriToPath(DirtyUri)]),
					),
				);
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},

		IsDirty: async (uri) => {
			try {
				const Result = await IPCService.invoke(Channel.WorkingCopyIsDirty)([uri]);
				return Result === true;
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},

		Revert: async (uri) => {
			try {
				await IPCService.invoke(Channel.TextFileRead)([UriToPath(uri)]);
			} catch (error) {
				throw MakeTextFileProblem(error);
			}
		},
	};

	return Service;
}

export const LiveTextFileService = makeLiveTextFileService();

export default LiveTextFileService;
