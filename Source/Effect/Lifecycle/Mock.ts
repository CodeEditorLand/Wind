import { Layer } from "effect";

import { StubLifecycleService } from "./Implementation/LifecycleStub.js";
import { LifecycleServiceTag } from "./Tag/LifecycleServiceTag.js";

export const MockLifecycleServiceLayer = Layer.succeed(
	LifecycleServiceTag,

	StubLifecycleService,
);

export default MockLifecycleServiceLayer;
