2|
3|import { StubOutputService } from "./Implementation/OutputStub.js";

4|import { OutputServiceTag } from "./Tag/OutputServiceTag.js";

5|
6|export const MockOutputServiceLayer = Layer.succeed(
7|	OutputServiceTag,

8|
9|	StubOutputService,

10|);

11|
12|export default MockOutputServiceLayer;

13|
