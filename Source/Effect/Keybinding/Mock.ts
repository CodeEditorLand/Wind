import { Layer } from "effect";

import { StubKeybindingService } from "./Implementation/KeybindingStub.js";
import { KeybindingServiceTag } from "./Tag/KeybindingServiceTag.js";

export const MockKeybindingServiceLayer = Layer.succeed(
	KeybindingServiceTag,

	StubKeybindingService,
);

export default MockKeybindingServiceLayer;
