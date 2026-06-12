2|
3|import type { LabelService } from "../Interface/LabelService.js";
4|
5|export class LabelServiceTag extends Context.Tag("Application/LabelService")<
6|	LabelServiceTag,
7|	LabelService
8|>() {}
9|
10|export const Label = LabelServiceTag;
11|
12|export default LabelServiceTag;
13|
