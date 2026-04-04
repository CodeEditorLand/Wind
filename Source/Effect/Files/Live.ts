import { Layer } from "effect";
import { FilesServiceTag } from "./Tag/FilesServiceTag.js";
import { StubFilesService } from "./Implementation/FilesStub.js";

export const LiveFilesServiceLayer = Layer.succeed(
	FilesServiceTag,
	StubFilesService,
);

export default LiveFilesServiceLayer;
