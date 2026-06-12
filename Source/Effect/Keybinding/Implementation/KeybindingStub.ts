import { Effect } from "effect";

import type { KeybindingService } from "../Interface/KeybindingService.js";

export const StubKeybindingService: KeybindingService = {

	AddKeybinding: (_commandId, _keybinding, _when) => Effect.void,

	RemoveKeybinding: (_commandId) => Effect.void,

	LookupKeybinding: (_commandId) => Effect.succeed(null),

	GetKeybindings: () => Effect.succeed([]),
};

export default StubKeybindingService;
