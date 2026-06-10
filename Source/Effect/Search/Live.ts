/**
 * @module Effect/Search/Live
 * @description
 * Live implementation of SearchService via Tauri IPC. Delegates to Mountain's
 * find_text_in_files and find_files handlers which perform native filesystem
 * searches using tokio and globset.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   search:findInFiles  → find_text_in_files (line-by-line grep, max 1000 results)
 *   search:findFiles    → find_files (globset glob walk)
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import type { IPCService } from "../IPC/Interface/IPCService.js";
import type { SearchService } from "./Interface/SearchService.js";
import { SearchServiceTag } from "./Tag/SearchServiceTag.js";
import type { SearchProblem } from "./Type/SearchProblem.js";

const MakeSearchProblem = (error: unknown): SearchProblem =>
	error instanceof Error
		? { _tag: "SearchOperationFailed", error }
		: { _tag: "SearchOperationFailed", error: new Error(String(error)) };

function makeSearchService(): SearchService {
	const Globals = globalThis as any;

	const IPCService: IPCService = Globals.__CEL_SERVICES__?.IPC;

	const Service: SearchService = {
		FindInFiles: (options) =>
			IPCService.invoke(Channel.SearchFindInFiles)([
				options.pattern,

				options.isRegex ?? false,

				options.isCaseSensitive ?? false,

				options.isWordMatch ?? false,

				options.include ?? "**",

				options.exclude ?? "",

				options.maxResults ?? 1000,
			]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result)
						? (Result as readonly {
								uri: string;

								lineNumber: number;

								preview: string;
							}[])
						: [],
				),

				Effect.mapError(MakeSearchProblem),
			),

		FindFiles: (options) =>
			IPCService.invoke(Channel.SearchFindFiles)([
				options.pattern,

				options.maxResults ?? 500,
			]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly string[]) : [],
				),

				Effect.mapError(MakeSearchProblem),
			),
	};

	return Service;
}

export const LiveSearchServiceLayer = Layer.succeed(
	SearchServiceTag,

	makeSearchService(),
);

export default LiveSearchServiceLayer;
