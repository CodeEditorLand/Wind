import { Layer } from "effect";

import { StubProgressService } from "./Implementation/ProgressStub.js";
import { ProgressServiceTag } from "./Tag/ProgressServiceTag.js";

export const MockProgressServiceLayer = Layer.succeed(
	ProgressServiceTag,

	StubProgressService,
);

export default MockProgressServiceLayer;
