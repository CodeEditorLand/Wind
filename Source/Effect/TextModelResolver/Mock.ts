import { Layer } from "effect";

import { StubTextModelResolverService } from "./Implementation/TextModelResolverStub.js";
import { TextModelResolverServiceTag } from "./Tag/TextModelResolverServiceTag.js";

export const MockTextModelResolverServiceLayer = Layer.succeed(
	TextModelResolverServiceTag,

	StubTextModelResolverService,
);

export default MockTextModelResolverServiceLayer;
