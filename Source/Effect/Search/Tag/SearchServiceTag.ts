import { Context } from "effect";

import type { SearchService } from "../Interface/SearchService.js";

export class SearchServiceTag extends Context.Tag("Application/SearchService")<
	SearchServiceTag,
	SearchService
>() {}

export const Search = SearchServiceTag;
export default SearchServiceTag;
