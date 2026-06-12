2|
3|import { StubWorkingCopyService } from "./Implementation/WorkingCopyStub.js";

4|import { WorkingCopyServiceTag } from "./Tag/WorkingCopyServiceTag.js";

5|
6|export const MockWorkingCopyServiceLayer = Layer.succeed(
7|	WorkingCopyServiceTag,

8|
9|	StubWorkingCopyService,

10|);

11|
12|export default MockWorkingCopyServiceLayer;

13|
