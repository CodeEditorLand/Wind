2|
3|import type { SearchService } from "../Interface/SearchService.js";
4|
5|export class SearchServiceTag extends Context.Tag("Application/SearchService")<
6|	SearchServiceTag,
7|	SearchService
8|>() {}
9|
10|export const Search = SearchServiceTag;
11|
12|export default SearchServiceTag;
13|
