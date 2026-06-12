export type { SearchProblem } from "./Type/SearchProblem.js";

export type {
	SearchService,
	TextSearchOptions,
	TextSearchMatch,
	FileSearchOptions,
} from "./Interface/SearchService.js";

export { SearchServiceTag, Search } from "./Tag/SearchServiceTag.js";

export { StubSearchService } from "./Implementation/SearchStub.js";

export { default as LiveSearchServiceLayer } from "./Live.js";

export { default as MockSearchServiceLayer } from "./Mock.js";
