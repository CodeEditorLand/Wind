import { Layer } from "effect";
import { TerminalServiceTag } from "./Tag/TerminalServiceTag.js";
import { StubTerminalService } from "./Implementation/TerminalStub.js";

export const MockTerminalServiceLayer = Layer.succeed(
	TerminalServiceTag,
	StubTerminalService,
);

export default MockTerminalServiceLayer;
