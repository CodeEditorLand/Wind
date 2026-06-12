import type { FilesService } from "../Interface/FilesService.js";

export const StubFilesService: FilesService = {
	ReadFile: () => { throw new Error("stub"); },

	WriteFile: () => Promise.resolve(),

	Stat: () => { throw new Error("stub"); },

	ReadDir: () => Promise.resolve([]),

	CreateDirectory: () => Promise.resolve(),

	Delete: () => Promise.resolve(),

	Rename: () => Promise.resolve(),

	Copy: () => Promise.resolve(),

	Exists: () => Promise.resolve(false),

	Watch: () => Promise.resolve({ dispose: () => {} }),

	ShowOpenDialog: () => Promise.resolve([]),

	ShowSaveDialog: () => Promise.resolve(undefined),
};

export default StubFilesService;
