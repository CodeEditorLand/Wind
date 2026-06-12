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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { SearchService } from "./Interface/SearchService.js";
import type { SearchProblem } from "./Type/SearchProblem.js";

const MakeSearchProblem = (error: unknown): SearchProblem =>
	error instanceof Error
		? { _tag: "SearchOperationFailed", error }
		: { _tag: "SearchOperationFailed", error: new Error(String(error)) };

/**
 * Wire contract: include/exclude always travel as `string[]`. Accepts the
 * workbench's single-string form and multi-root array form; empty strings
 * are dropped.
 */
const ToGlobArray = (
	Value: string | readonly string[] | undefined,
): readonly string[] =>
	Array.isArray(Value)
		? (Value as readonly string[]).filter(
				(Pattern) => typeof Pattern === "string" && Pattern !== "",
			)
		: typeof Value === "string" && Value !== ""
			? [Value]
			: [];

export const LiveSearchService: SearchService = {
	FindInFiles: (options) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.SearchFindInFiles, [
				options.pattern,
				options.isRegex ?? false,
				options.isCaseSensitive ?? false,
				options.isWordMatch ?? false,
				ToGlobArray(options.include ?? "**"),
				ToGlobArray(options.exclude),
				options.maxResults ?? 1000,
			]);

			void (Result as Promise<unknown>).catch(() => {});

			return [];
		} catch (error) {
			throw MakeSearchProblem(error);
		}
	},

	FindFiles: (options) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.SearchFindFiles, [
				options.pattern,
				options.maxResults ?? 500,
			]);

			void (Result as Promise<unknown>).catch(() => {});

			return [];
		} catch (error) {
			throw MakeSearchProblem(error);
		}
	},
};

export default LiveSearchService;
