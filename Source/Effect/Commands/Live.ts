import { Layer } from "effect";
import { CommandsServiceTag } from "./Tag/CommandsServiceTag.js";
import { StubCommandsService } from "./Implementation/CommandsStub.js";

export const LiveCommandsServiceLayer = Layer.succeed(
	CommandsServiceTag,
	StubCommandsService,
);

export default LiveCommandsServiceLayer;
