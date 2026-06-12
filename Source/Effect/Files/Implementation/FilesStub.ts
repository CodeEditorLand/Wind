import { Effect } from "effect";

import type { FilesService } from "../Interface/FilesService.js";

export const StubFilesService: FilesService = {

	ReadFile: () => Effect.die(new Error("stub")),

	WriteFile: () => Effect.void,

	Stat: () => Effect.die(new Error("stub")),

	ReadDir: () => Effect.succeed([]),

	CreateDirectory: () => Effect.void,

	Delete: () => Effect.void,

	Rename: () => Effect.void,

	Copy: () => Effect.void,

	Exists: () => Effect.succeed(false),

	Watch: () => Effect.succeed({ dispose: () => {} }),

	ShowOpenDialog: () => Effect.succeed([]),

	ShowSaveDialog: () => Effect.succeed(undefined),
};

export default StubFilesService;
