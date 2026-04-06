import { Effect } from "effect";

import type { ThemesService } from "../Interface/ThemesService.js";

const DefaultTheme = {
	id: "Default Dark Modern",
	label: "Default Dark Modern",
	kind: "dark" as const,
};

export const StubThemesService: ThemesService = {
	GetActiveTheme: () => Effect.succeed(DefaultTheme),
	ListThemes: () => Effect.succeed([DefaultTheme]),
	SetTheme: (_themeId) => Effect.void,
};

export default StubThemesService;
