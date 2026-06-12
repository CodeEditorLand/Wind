import type { ThemesService } from "../Interface/ThemesService.js";

const DefaultTheme = {
	id: "Default Dark Modern",

	label: "Default Dark Modern",

	kind: "dark" as const,
};

export const StubThemesService: ThemesService = {
	GetActiveTheme: () => DefaultTheme,

	ListThemes: () => [DefaultTheme],

	SetTheme: (_themeId) => {},
};

export default StubThemesService;
