export type WorkbenchThemeProblem =
	| { readonly _tag: "WorkbenchThemeBridgeUnavailable"; readonly reason: string }
	| { readonly _tag: "WorkbenchThemeNotFound"; readonly themeId: string }
	| { readonly _tag: "WorkbenchThemeApplyFailed"; readonly error: Error };
