import { Layer } from "effect";

import { StubSearchService } from "./Implementation/SearchStub.js";
import { SearchServiceTag } from "./Tag/SearchServiceTag.js";

export const MockSearchServiceLayer = Layer.succeed(
	SearchServiceTag,

	StubSearchService,
);

export default MockSearchServiceLayer;
