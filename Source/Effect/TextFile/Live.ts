/**
 * @module Effect/TextFile/Live
 * @description
 * Live implementation of TextFileService backed by Mountain's textFile IPC
 * channels. Reads and writes UTF-8 text files.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   textFile:read  → tokio::fs::read_to_string
 *   textFile:write → tokio::fs::write
 *   textFile:save  → no-op dirty-state hint
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import type { TextFileService } from "./Interface/TextFileService.js";
import { TextFileServiceTag } from "./Tag/TextFileServiceTag.js";
import type { TextFileProblem } from "./Type/TextFileProblem.js";

const UriToPath = (uri: string): string =>
	uri.startsWith("file://") ? uri.slice("file://".length) : uri;

const MakeTextFileProblem = (error: unknown): TextFileProblem =>
	error instanceof Error
		? { _tag: "TextFileOperationFailed", error }
		: { _tag: "TextFileOperationFailed", error: new Error(String(error)) };

function makeLiveTextFileService(): TextFileService {
	const Globals = globalThis as any;

	const IPCService = Globals.__CEL_SERVICES__?.IPC ?? null;

	const Service: TextFileService = {
		Read: (uri) =>
			IPCService.invoke(Channel.TextFileRead)([UriToPath(uri)]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : String(Result),
				),

				Effect.mapError(MakeTextFileProblem),
			),

		Write: (uri, content) =>
			IPCService.invoke(Channel.TextFileWrite)([
				UriToPath(uri),

				content,
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTextFileProblem),
			),

		Save: (uri) =>
			IPCService.invoke(Channel.TextFileSave)([UriToPath(uri)]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTextFileProblem),
			),

		SaveAll: () =>
			IPCService.invoke(Channel.TextFileSave)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTextFileProblem),
			),

		IsDirty: (_uri) => Effect.succeed(false),

		Revert: (uri) =>
			IPCService.invoke(Channel.TextFileRead)([UriToPath(uri)]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTextFileProblem),
			),
	};

	return Service;
}

export const LiveTextFileServiceLayer = Layer.succeed(
	TextFileServiceTag,

	makeLiveTextFileService(),
);

export default LiveTextFileServiceLayer;
