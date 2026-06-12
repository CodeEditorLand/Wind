import { Layer } from "effect";

import { StubModelService } from "./Implementation/ModelStub.js";

import { ModelServiceTag } from "./Tag/ModelServiceTag.js";

export const MockModelServiceLayer = Layer.succeed(
	ModelServiceTag,

	StubModelService,
);

export default MockModelServiceLayer;
