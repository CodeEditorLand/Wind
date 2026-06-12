import type { QuickInputService } from "../Interface/QuickInputService.js";

export const StubQuickInputService: QuickInputService = {
	ShowQuickPick: (_items, _options) => Promise.resolve(undefined),

	ShowInputBox: (_options) => Promise.resolve(undefined),
};

export default StubQuickInputService;
