2|
3|import { StubTextModelResolverService } from "./Implementation/TextModelResolverStub.js";
4|import { TextModelResolverServiceTag } from "./Tag/TextModelResolverServiceTag.js";
5|
6|export const MockTextModelResolverServiceLayer = Layer.succeed(
7|	TextModelResolverServiceTag,
8|
9|	StubTextModelResolverService,
10|);
11|
12|export default MockTextModelResolverServiceLayer;
13|
