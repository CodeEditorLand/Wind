2|
3|import { StubStorageService } from "./Implementation/StorageStub.js";

4|import { StorageServiceTag } from "./Tag/StorageServiceTag.js";

5|
6|export const MockStorageServiceLayer = Layer.succeed(
7|	StorageServiceTag,

8|
9|	StubStorageService,

10|);

11|
12|export default MockStorageServiceLayer;

13|
