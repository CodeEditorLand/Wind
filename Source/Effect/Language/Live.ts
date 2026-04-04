import { Layer } from "effect";
import { LanguageServiceTag } from "./Tag/LanguageServiceTag.js";
import { StubLanguageService } from "./Implementation/LanguageStub.js";

export const LiveLanguageServiceLayer = Layer.succeed(
	LanguageServiceTag,
	StubLanguageService,
);

export default LiveLanguageServiceLayer;
