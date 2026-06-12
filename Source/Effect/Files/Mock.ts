import { Layer } from "effect";

import { StubFilesService } from "./Implementation/FilesStub.js";

import { FilesServiceTag } from "./Tag/FilesServiceTag.js";

export const MockFilesServiceLayer = Layer.succeed(
	FilesServiceTag,

	StubFilesService,
);

export default MockFilesServiceLayer;
