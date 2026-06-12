2|
3|import { StubCommandsService } from "./Implementation/CommandsStub.js";
4|import { CommandsServiceTag } from "./Tag/CommandsServiceTag.js";
5|
6|export const MockCommandsServiceLayer = Layer.succeed(
7|	CommandsServiceTag,
8|
9|	StubCommandsService,
10|);
11|
12|export default MockCommandsServiceLayer;
13|
