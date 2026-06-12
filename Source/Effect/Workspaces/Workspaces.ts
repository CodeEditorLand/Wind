export type { WorkspacesProblem } from "./Type/WorkspacesProblem.js";

export type {
	WorkspacesService,
	WorkspaceFolder,
} from "./Interface/WorkspacesService.js";

export { StubWorkspacesService } from "./Implementation/WorkspacesStub.js";

export { default as LiveWorkspacesService } from "./Live.js";

export { default as MockWorkspacesService } from "./Mock.js";
