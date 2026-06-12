import type { HistoryService } from "../Interface/HistoryService.js";

export const StubHistoryService: HistoryService = {
	GoBack: async () => {},

	GoForward: async () => {},

	CanGoBack: async () => false,

	CanGoForward: async () => false,

	Push: async (_uri) => {},

	Clear: async () => {},

	GetStack: async () => [],
};

export default StubHistoryService;
