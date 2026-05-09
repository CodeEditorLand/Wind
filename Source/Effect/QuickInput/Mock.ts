import { Layer } from "effect";

import { StubQuickInputService } from "./Implementation/QuickInputStub.js";
import { QuickInputServiceTag } from "./Tag/QuickInputServiceTag.js";

export const MockQuickInputServiceLayer = Layer.succeed(
	QuickInputServiceTag,

	StubQuickInputService,
);

export default MockQuickInputServiceLayer;
