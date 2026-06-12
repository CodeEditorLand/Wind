export type {
	UpstreamExtensionDescriptor,
	WorkbenchExtensionBridgeShape,
	WorkbenchExtensionGlobals,
} from "./Implementation/WorkbenchExtensionBridgeShape.js";

export { WorkbenchExtensionLive } from "./Implementation/WorkbenchExtensionLive.js";

export type {
	WorkbenchExtensionDescriptor,
	WorkbenchExtensionService,
} from "./Interface/WorkbenchExtensionService.js";

export type {
	WorkbenchExtension,
	WorkbenchExtensionServiceTag,
} from "./Tag/WorkbenchExtensionServiceTag.js";

export type { WorkbenchExtensionProblem } from "./Type/WorkbenchExtensionProblem.js";

export { WorkbenchExtensionError } from "./Type/WorkbenchExtensionProblem.js";
