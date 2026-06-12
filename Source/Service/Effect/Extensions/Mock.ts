2|
3|import { StubExtensionsService } from "./Implementation/ExtensionsStub.js";

4|import { ExtensionsServiceTag } from "./Tag/ExtensionsServiceTag.js";

5|
6|export const MockExtensionsServiceLayer = Layer.succeed(
7|	ExtensionsServiceTag,

8|
9|	StubExtensionsService,

10|);

11|
12|export default MockExtensionsServiceLayer;

13|
