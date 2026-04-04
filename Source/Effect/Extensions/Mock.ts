import { Layer } from "effect";
import { ExtensionsServiceTag } from "./Tag/ExtensionsServiceTag.js";
import { StubExtensionsService } from "./Implementation/ExtensionsStub.js";

export const MockExtensionsServiceLayer = Layer.succeed(
	ExtensionsServiceTag,
	StubExtensionsService,
);

export default MockExtensionsServiceLayer;
