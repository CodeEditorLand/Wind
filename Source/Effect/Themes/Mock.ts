2|
3|import { StubThemesService } from "./Implementation/ThemesStub.js";
4|import { ThemesServiceTag } from "./Tag/ThemesServiceTag.js";
5|
6|export const MockThemesServiceLayer = Layer.succeed(
7|	ThemesServiceTag,
8|
9|	StubThemesService,
10|);
11|
12|export default MockThemesServiceLayer;
13|
