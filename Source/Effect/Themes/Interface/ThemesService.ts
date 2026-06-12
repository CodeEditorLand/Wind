import type { Effect } from "effect";

import type { ThemesProblem } from "../Type/ThemesProblem.js";

export type ColorThemeKind =
	| "light"
	| "dark"
	| "highContrast"
	| "highContrastLight";

export interface ColorTheme {

	readonly id: string;

	readonly label: string;

	readonly kind: ColorThemeKind;
}

export interface ThemesService {

	readonly GetActiveTheme: () => Effect.Effect<ColorTheme, ThemesProblem>;

	readonly ListThemes: () => Effect.Effect<
		readonly ColorTheme[],

		ThemesProblem
	>;

	readonly SetTheme: (themeId: string) => Effect.Effect<void, ThemesProblem>;
}
