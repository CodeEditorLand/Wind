export type {
	WorkbenchEditorServiceTag,
	WorkbenchEditor,
} from "./Tag/WorkbenchEditorServiceTag.js";

export type {
	WorkbenchEditorService,
	WorkbenchEditorOpenInput,
	WorkbenchEditorActiveSnapshot,
	WorkbenchEditorChangeEvent,
} from "./Interface/WorkbenchEditorService.js";

export type { WorkbenchEditorProblem } from "./Type/WorkbenchEditorProblem.js";

export type {
	UpstreamEditorPaneSnapshot,
	UpstreamEditorActiveChangedEvent,
	WorkbenchEditorBridgeShape,
	WorkbenchEditorGlobals,
} from "./Implementation/WorkbenchEditorBridgeShape.js";

export { WorkbenchEditorLive } from "./Implementation/WorkbenchEditorLive.js";
