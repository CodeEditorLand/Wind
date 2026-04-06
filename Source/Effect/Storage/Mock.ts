import { Layer } from "effect";

import { StubStorageService } from "./Implementation/StorageStub.js";
import { StorageServiceTag } from "./Tag/StorageServiceTag.js";

export const MockStorageServiceLayer = Layer.succeed(
	StorageServiceTag,
	StubStorageService,
);

export default MockStorageServiceLayer;
