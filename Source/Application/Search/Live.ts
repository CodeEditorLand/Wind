

// Source/Application/Search/Live.ts
import { Effect, Layer, Stream, path, glob, an-array-library } from "effect";
import { URI } from "vs/base/common/uri.js";
import SearchServiceTag, { type Interface as SearchService } from "./Tag.js";
import { RipgrepSearch } from "../../../Integration/Tauri/Search.js";
import type { IFileQuery, IFileMatch, QueryGlobTester } from "vs/workbench/services/search/common/search.js";

const LiveSearchService = Layer.succeed(
	SearchServiceTag,
	{
		_serviceBrand: undefined,

		fileSearch: (query: IFileQuery): Stream.Stream<IFileMatch, SearchProblem> => {
			// Merge streams from all folder queries
			return Stream.mergeAll(
				query.folderQueries.map(folderQuery => {
					// The GlobTester logic from the original file would be refactored
					// into a pure `Predicate` that can be used with `Stream.filter`.
					const globTester = new QueryGlobTester(query, folderQuery); // Assume this is now pure

					return RipgrepSearch(query, folderQuery).pipe(
						// Apply filters declaratively
						Stream.filter(relativePath => globTester.includedInQuerySync(relativePath)),

						// Transform relative path strings into `IFileMatch` objects
						Stream.map(relativePath => ({
							resource: URI.joinPath(folderQuery.folder, relativePath)
						})),

						// Handle `extraFileResources`
						Stream.concat(Stream.fromIterable(query.extraFileResources ?? []).pipe(
							Stream.filter(uri => globTester.includedInQuerySync(uri.path)),
							Stream.map(uri => ({ resource: uri }))
						))
					);
				}),
				{ concurrency: "unbounded" } // Run searches in all folders concurrently
			).pipe(
				// Apply global result limit
				Stream.take(query.maxResults ?? Infinity)
			);
		}
	}
);

export default LiveSearchService;
