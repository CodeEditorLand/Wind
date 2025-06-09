/*
 * File: Wind/Source/Application/Search/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ./Error/SearchProblem.js, effect, vs/base/common/uri.js
 * Export: Interface
 */

// Source/Application/Search/Tag.ts
import { Context, Stream } from "effect";
import { URI } from "vs/base/common/uri.js";
import type {
	IFileMatch,
	IFileQuery,
	ISearchComplete,
} from "vs/workbench/services/search/common/search.js";

import type { SearchProblem } from "./Error/SearchProblem.js";

export interface Interface {
	readonly _serviceBrand: undefined;

	// The key change: fileSearch now returns a Stream of matches, not a Promise.
	// This allows consumers to process results as they arrive.
	fileSearch(query: IFileQuery): Stream.Stream<IFileMatch, SearchProblem>;

	// The textSearch would be refactored similarly.
	// textSearch(...): Stream.Stream<...>;
}

const SearchServiceTag = Context.Tag<Interface>("vscode/SearchService");

export default SearchServiceTag;
