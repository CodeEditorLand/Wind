import { Layer } from "effect";
import { OutputServiceTag } from "./Tag/OutputServiceTag.js";
import { StubOutputService } from "./Implementation/OutputStub.js";

export const MockOutputServiceLayer = Layer.succeed(
	OutputServiceTag,
	StubOutputService,
);

export default MockOutputServiceLayer;
