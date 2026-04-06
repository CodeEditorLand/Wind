import { Effect } from "effect";

import type { QuickInputService } from "../Interface/QuickInputService.js";

export const StubQuickInputService: QuickInputService = {
	ShowQuickPick: (_items, _options) => Effect.succeed(undefined),
	ShowInputBox: (_options) => Effect.succeed(undefined),
};

export default StubQuickInputService;
