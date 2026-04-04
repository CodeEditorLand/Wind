import { Layer } from "effect";
import { CommandsServiceTag } from "./Tag/CommandsServiceTag.js";
import { StubCommandsService } from "./Implementation/CommandsStub.js";

export const MockCommandsServiceLayer = Layer.succeed(
	CommandsServiceTag,
	StubCommandsService,
);

export default MockCommandsServiceLayer;
