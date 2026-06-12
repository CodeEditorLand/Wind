import { Layer } from "effect";

import { StubLabelService } from "./Implementation/LabelStub.js";
import { LabelServiceTag } from "./Tag/LabelServiceTag.js";

export const MockLabelServiceLayer = Layer.succeed(
	LabelServiceTag,

	StubLabelService,
);

export default MockLabelServiceLayer;
