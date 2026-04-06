import { Layer } from "effect";

import { StubWorkspacesService } from "./Implementation/WorkspacesStub.js";
import { WorkspacesServiceTag } from "./Tag/WorkspacesServiceTag.js";

export const MockWorkspacesServiceLayer = Layer.succeed(
	WorkspacesServiceTag,
	StubWorkspacesService,
);

export default MockWorkspacesServiceLayer;
