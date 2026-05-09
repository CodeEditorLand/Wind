import { Layer } from "effect";

import { StubLanguageService } from "./Implementation/LanguageStub.js";
import { LanguageServiceTag } from "./Tag/LanguageServiceTag.js";

export const MockLanguageServiceLayer = Layer.succeed(
	LanguageServiceTag,

	StubLanguageService,
);

export default MockLanguageServiceLayer;
