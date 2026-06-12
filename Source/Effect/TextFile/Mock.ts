import { Layer } from "effect";

import { StubTextFileService } from "./Implementation/TextFileStub.js";
import { TextFileServiceTag } from "./Tag/TextFileServiceTag.js";

export const MockTextFileServiceLayer = Layer.succeed(
	TextFileServiceTag,

	StubTextFileService,
);

export default MockTextFileServiceLayer;
