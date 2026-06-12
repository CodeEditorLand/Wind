import type { TerminalService } from "../Interface/TerminalService.js";

export const StubTerminalService: TerminalService = {
	CreateTerminal: (_options) => Promise.resolve({ id: 0, name: "terminal" }),

	SendText: (_id, _text) => Promise.resolve(),

	Dispose: (_id) => Promise.resolve(),

	Show: (_id, _preserveFocus) => Promise.resolve(),

	Hide: (_id) => Promise.resolve(),
};

export default StubTerminalService;
