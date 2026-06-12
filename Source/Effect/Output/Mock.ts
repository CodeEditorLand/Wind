import { Layer } from "effect";

import { StubOutputService } from "./Implementation/OutputStub.js";

import { OutputServiceTag } from "./Tag/OutputServiceTag.js";

export const MockOutputServiceLayer = Layer.succeed(
	OutputServiceTag,

	StubOutputService,
);

export default MockOutputServiceLayer;
