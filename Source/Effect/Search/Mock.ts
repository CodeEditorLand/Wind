2|
3|import { StubSearchService } from "./Implementation/SearchStub.js";
4|import { SearchServiceTag } from "./Tag/SearchServiceTag.js";
5|
6|export const MockSearchServiceLayer = Layer.succeed(
7|	SearchServiceTag,
8|
9|	StubSearchService,
10|);
11|
12|export default MockSearchServiceLayer;
13|
