import { Effect } from "effect";

import type { WorkspacesService } from "../Interface/WorkspacesService.js";

export const StubWorkspacesService: WorkspacesService = {
	GetFolders: () => Effect.succeed([]),
	AddFolder: (_uri, _name) => Effect.void,
	RemoveFolder: (_uri) => Effect.void,
	GetName: () => Effect.succeed(undefined),
};

export default StubWorkspacesService;
