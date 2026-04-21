import { Effect, Stream } from "effect";

import type { WorkspacesService } from "../Interface/WorkspacesService.js";

export const StubWorkspacesService: WorkspacesService = {
	GetFolders: () => Effect.succeed([]),
	AddFolder: (_uri, _name) => Effect.void,
	RemoveFolder: (_uri) => Effect.void,
	GetName: () => Effect.succeed(undefined),
	// The stub never emits - tests that want change events should build a
	// custom layer with `Stream.fromIterable` of scripted events.
	OnChange: () => Stream.empty,
};

export default StubWorkspacesService;
