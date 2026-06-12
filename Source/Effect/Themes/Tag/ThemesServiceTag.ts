2|
3|import type { ThemesService } from "../Interface/ThemesService.js";
4|
5|export class ThemesServiceTag extends Context.Tag("Application/ThemesService")<
6|	ThemesServiceTag,
7|	ThemesService
8|>() {}
9|
10|export const Themes = ThemesServiceTag;
11|
12|export default ThemesServiceTag;
13|
