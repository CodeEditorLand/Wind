export {
	WorkbenchExtensionServiceTag,
	WorkbenchExtension,
} from "./Tag/WorkbenchExtensionServiceTag.js";

export type {
	WorkbenchExtensionService,
	WorkbenchExtensionDescriptor,
} from "./Interface/WorkbenchExtensionService.js";

export type { WorkbenchExtensionProblem } from "./Type/WorkbenchExtensionProblem.js";

export type {
	UpstreamExtensionDescriptor,
	WorkbenchExtensionBridgeShape,
	WorkbenchExtensionGlobals,
} from "./Implementation/WorkbenchExtensionBridgeShape.js";

export { WorkbenchExtensionLive } from "./Implementation/WorkbenchExtensionLive.js";
