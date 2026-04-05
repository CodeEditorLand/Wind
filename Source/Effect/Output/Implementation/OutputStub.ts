import { Effect } from "effect";
import type { OutputService } from "../Interface/OutputService.js";

export const StubOutputService: OutputService = {
	CreateChannel: (name) => Effect.succeed({ name }),
	Append: (_name, _text) => Effect.void,
	AppendLine: (_name, _line) => Effect.void,
	Clear: (_name) => Effect.void,
	Show: (_name) => Effect.void,
	Dispose: (_name) => Effect.void,
};

export default StubOutputService;
