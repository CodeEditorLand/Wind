2|
3|import type { WorkingCopyService } from "../Interface/WorkingCopyService.js";
4|
5|export class WorkingCopyServiceTag extends Context.Tag(
6|	"Application/WorkingCopyService",
7|)<WorkingCopyServiceTag, WorkingCopyService>() {}
8|
9|export const WorkingCopy = WorkingCopyServiceTag;
10|
11|export default WorkingCopyServiceTag;
12|
