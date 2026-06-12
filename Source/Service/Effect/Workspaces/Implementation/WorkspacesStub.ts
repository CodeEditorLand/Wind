import type { WorkspacesService } from "../Interface/WorkspacesService.js";

const emptyStream = new ReadableStream<never>({
	start(controller) {
		controller.close();
	},
});

export const StubWorkspacesService: WorkspacesService = {
	GetFolders: () => Promise.resolve([]),

	AddFolder: (_uri, _name) => Promise.resolve(),

	RemoveFolder: (_uri) => Promise.resolve(),

	GetName: () => Promise.resolve(undefined),

	// The stub never emits - tests that want change events should build a
	// custom layer with events.
	OnChange: () => emptyStream,
};

export default StubWorkspacesService;
