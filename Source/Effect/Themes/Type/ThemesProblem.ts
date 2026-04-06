export type ThemesProblem =
	| { readonly _tag: "ThemesNotAvailable"; readonly reason: string }
	| { readonly _tag: "ThemesOperationFailed"; readonly error: Error }
	| { readonly _tag: "ThemeNotFound"; readonly themeId: string };
