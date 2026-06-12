import type { KeybindingService } from "../Interface/KeybindingService.js";

export const StubKeybindingService: KeybindingService = {
	AddKeybinding: (_commandId, _keybinding, _when) => Promise.resolve(),

	RemoveKeybinding: (_commandId) => Promise.resolve(),

	LookupKeybinding: (_commandId) => Promise.resolve(null),

	GetKeybindings: () => Promise.resolve([]),
};

export default StubKeybindingService;
