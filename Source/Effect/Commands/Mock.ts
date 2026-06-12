import { Layer } from "effect";

import { StubCommandsService } from "./Implementation/CommandsStub.js";

import { CommandsServiceTag } from "./Tag/CommandsServiceTag.js";

export const MockCommandsServiceLayer = Layer.succeed(
	CommandsServiceTag,

	StubCommandsService,
);

export default MockCommandsServiceLayer;
