import { Layer } from "effect";

import { StubThemesService } from "./Implementation/ThemesStub.js";
import { ThemesServiceTag } from "./Tag/ThemesServiceTag.js";

export const MockThemesServiceLayer = Layer.succeed(
	ThemesServiceTag,
	StubThemesService,
);

export default MockThemesServiceLayer;
