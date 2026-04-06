import { Layer } from "effect";

import { StubExtensionsService } from "./Implementation/ExtensionsStub.js";
import { ExtensionsServiceTag } from "./Tag/ExtensionsServiceTag.js";

export const MockExtensionsServiceLayer = Layer.succeed(
	ExtensionsServiceTag,
	StubExtensionsService,
);

export default MockExtensionsServiceLayer;
