export type WorkbenchThemeProblem =
	| {
			readonly _tag: "WorkbenchThemeBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchThemeNotFound"; readonly themeId: string }
	| { readonly _tag: "WorkbenchThemeApplyFailed"; readonly error: Error };

export class WorkbenchThemeError extends Error {
	readonly _tag = "WorkbenchThemeError" as const;

	constructor(readonly Problem: WorkbenchThemeProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchThemeError";
	}
}
