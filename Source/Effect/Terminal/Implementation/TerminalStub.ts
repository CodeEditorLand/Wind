import { Effect } from "effect";
import type { TerminalService } from "../Interface/TerminalService.js";

export const StubTerminalService: TerminalService = {
	CreateTerminal: (_options) => Effect.succeed({ id: 0, name: "terminal" }),
	SendText: (_id, _text) => Effect.void,
	Dispose: (_id) => Effect.void,
	Show: (_id, _preserveFocus) => Effect.void,
	Hide: (_id) => Effect.void,
};

export default StubTerminalService;
