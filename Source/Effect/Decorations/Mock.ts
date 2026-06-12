import { Layer } from "effect";

import { StubDecorationsService } from "./Implementation/DecorationsStub.js";
import { DecorationsServiceTag } from "./Tag/DecorationsServiceTag.js";

export const MockDecorationsServiceLayer = Layer.succeed(
	DecorationsServiceTag,

	StubDecorationsService,
);

export default MockDecorationsServiceLayer;
