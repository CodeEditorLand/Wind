import { Layer } from "effect";
import { TextFileServiceTag } from "./Tag/TextFileServiceTag.js";
import { StubTextFileService } from "./Implementation/TextFileStub.js";

export const MockTextFileServiceLayer = Layer.succeed(
	TextFileServiceTag,
	StubTextFileService,
);

export default MockTextFileServiceLayer;
