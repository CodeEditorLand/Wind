import { Effect } from "effect";

import type { SearchService } from "../Interface/SearchService.js";

export const StubSearchService: SearchService = {

	FindInFiles: (_options) => Effect.succeed([]),

	FindFiles: (_options) => Effect.succeed([]),
};

export default StubSearchService;
