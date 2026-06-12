2|
3|import type { OutputService } from "../Interface/OutputService.js";

4|
5|export const StubOutputService: OutputService = {

6|	CreateChannel: (name) => Effect.succeed({ name }),

7|
8|	Append: (_name, _text) => Effect.void,

9|
10|	AppendLine: (_name, _line) => Effect.void,

11|
12|	Clear: (_name) => Effect.void,

13|
14|	Show: (_name) => Effect.void,

15|
16|	Dispose: (_name) => Effect.void,

17|};

18|
19|export default StubOutputService;

20|
