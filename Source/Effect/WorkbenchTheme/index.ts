export type {
	WorkbenchThemeServiceTag,
	WorkbenchTheme,
} from "./Tag/WorkbenchThemeServiceTag.js";

export type {
	WorkbenchThemeService,
	WorkbenchThemeDescriptor,
	WorkbenchThemeChangeEvent,
	WorkbenchThemeKind,
} from "./Interface/WorkbenchThemeService.js";

export type { WorkbenchThemeProblem } from "./Type/WorkbenchThemeProblem.js";

export type {
	WorkbenchThemeBridgeShape,
	WorkbenchThemeGlobals,
	UpstreamWorkbenchTheme,
	UpstreamWorkbenchColorTheme,
} from "./Implementation/WorkbenchThemeBridgeShape.js";

export { WorkbenchThemeKindFromUpstream } from "./Implementation/WorkbenchThemeBridgeShape.js";

export { WorkbenchThemeLive } from "./Implementation/WorkbenchThemeLive.js";
