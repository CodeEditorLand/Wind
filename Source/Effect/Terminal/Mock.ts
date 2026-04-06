import { Layer } from "effect";

import { StubTerminalService } from "./Implementation/TerminalStub.js";
import { TerminalServiceTag } from "./Tag/TerminalServiceTag.js";

export const MockTerminalServiceLayer = Layer.succeed(
	TerminalServiceTag,
	StubTerminalService,
);

export default MockTerminalServiceLayer;
