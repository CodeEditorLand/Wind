import { Effect } from "effect";

import type { HistoryService } from "../Interface/HistoryService.js";

export const StubHistoryService: HistoryService = {
	GoBack: () => Effect.void,

	GoForward: () => Effect.void,

	CanGoBack: () => Effect.succeed(false),

	CanGoForward: () => Effect.succeed(false),

	Push: (_uri) => Effect.void,

	Clear: () => Effect.void,

	GetStack: () => Effect.succeed([]),
};

export default StubHistoryService;
