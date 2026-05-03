import type { WorkbenchLayoutPart } from "../Interface/WorkbenchLayoutService.js";

export interface WorkbenchLayoutBridgeShape {
	readonly isVisible: (partId: string) => boolean;
	readonly setPartHidden: (hidden: boolean, partId: string) => void;
	readonly onDidChangePartVisibility: (listener: () => void) => {
		readonly dispose: () => void;
	};
}

export interface WorkbenchLayoutGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Layout?: WorkbenchLayoutBridgeShape | null;
	};
}

/**
 * VS Code's `Parts` enum string identifiers.
 *   workbench.parts.titlebar / activitybar / sidebar / panel /
 *   auxiliarybar / statusbar / banner / editor.
 */
export const WorkbenchLayoutPartId = (part: WorkbenchLayoutPart): string => {
	switch (part) {
		case "ActivityBar":
			return "workbench.parts.activitybar";
		case "Sidebar":
			return "workbench.parts.sidebar";
		case "Panel":
			return "workbench.parts.panel";
		case "AuxiliaryBar":
			return "workbench.parts.auxiliarybar";
		case "StatusBar":
			return "workbench.parts.statusbar";
		case "TitleBar":
			return "workbench.parts.titlebar";
		case "Banner":
			return "workbench.parts.banner";
	}
};

export const WorkbenchLayoutAllParts: ReadonlyArray<WorkbenchLayoutPart> = [
	"ActivityBar",
	"Sidebar",
	"Panel",
	"AuxiliaryBar",
	"StatusBar",
	"TitleBar",
	"Banner",
];
