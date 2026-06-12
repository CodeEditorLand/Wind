import { Context } from "effect";

import type { ThemesService } from "../Interface/ThemesService.js";

export class ThemesServiceTag extends Context.Tag("Application/ThemesService")<
	ThemesServiceTag,
	ThemesService
>() {}

export const Themes = ThemesServiceTag;

export default ThemesServiceTag;
