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
	readonly GetActiveTheme: () => ColorTheme;

	readonly ListThemes: () => readonly ColorTheme[];

	readonly SetTheme: (themeId: string) => void;
}
