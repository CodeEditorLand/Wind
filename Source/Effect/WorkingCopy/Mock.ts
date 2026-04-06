import { Layer } from "effect";

import { StubWorkingCopyService } from "./Implementation/WorkingCopyStub.js";
import { WorkingCopyServiceTag } from "./Tag/WorkingCopyServiceTag.js";

export const MockWorkingCopyServiceLayer = Layer.succeed(
	WorkingCopyServiceTag,
	StubWorkingCopyService,
);

export default MockWorkingCopyServiceLayer;
