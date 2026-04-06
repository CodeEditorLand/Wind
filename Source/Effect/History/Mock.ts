import { Layer } from "effect";

import { StubHistoryService } from "./Implementation/HistoryStub.js";
import { HistoryServiceTag } from "./Tag/HistoryServiceTag.js";

export const MockHistoryServiceLayer = Layer.succeed(
	HistoryServiceTag,
	StubHistoryService,
);

export default MockHistoryServiceLayer;
