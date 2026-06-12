import type { SearchService } from "../Interface/SearchService.js";

export const StubSearchService: SearchService = {
	FindInFiles: (_options) => [],

	FindFiles: (_options) => [],
};

export default StubSearchService;
