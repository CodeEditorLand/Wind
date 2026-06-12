1|/**
2| * @module Effect/Output/Live
3| * @description
4| * Live implementation of OutputService backed by Mountain's output channel
5| * infrastructure via Tauri IPC.
6| *
7| * IPC channels (WindServiceHandlers.rs):
8| *   output:create      → create channel (Sky renders panel)
9| *   output:append      → emit to Sky output panel
10| *   output:appendLine  → emit to Sky output panel (with newline)
11| *   output:clear       → clear output panel
12| *   output:show        → show output panel
13| *   output:dispose     → drop channel from Mountain's OutputChannelManager
14| */
15|
17|
18|import Channel from "../../IPC/Channel.js";

19|import { TauriIPCLive } from "../IPC/index.js";

20|import type { OutputService } from "./Interface/OutputService.js";

21|import { OutputServiceTag } from "./Tag/OutputServiceTag.js";

22|import type { OutputProblem } from "./Type/OutputProblem.js";

23|
24|const MakeOutputProblem = (error: unknown): OutputProblem =>
25|	error instanceof Error
26|		? { _tag: "OutputOperationFailed", error }

27|		: { _tag: "OutputOperationFailed", error: new Error(String(error)) };

28|
29|function makeOutputService(): OutputService {

30|	const IPCService = TauriIPCLive;

31|
32|	// Local set of active channel names for Dispose tracking
33|	const ActiveChannels = new Set<string>();

34|
35|	const Service: OutputService = {
36|		CreateChannel: (name) =>
37|			IPCService.invoke(Channel.OutputCreate)([name]).pipe(
38|				Effect.map(() => {
39|					ActiveChannels.add(name);

40|
41|					return { name };

42|				}),

43|
44|				Effect.mapError(MakeOutputProblem),

45|			),

46|
47|		Append: (channelName, text) =>
48|			IPCService.invoke(Channel.OutputAppend)([channelName, text]).pipe(
49|				Effect.map(() => undefined as void),

50|
51|				Effect.mapError(MakeOutputProblem),

52|			),

53|
54|		AppendLine: (channelName, line) =>
55|			IPCService.invoke(Channel.OutputAppendLine)([
56|				channelName,

57|
58|				line,

59|			]).pipe(
60|				Effect.map(() => undefined as void),

61|
62|				Effect.mapError(MakeOutputProblem),

63|			),

64|
65|		Clear: (channelName) =>
66|			IPCService.invoke(Channel.OutputClear)([channelName]).pipe(
67|				Effect.map(() => undefined as void),

68|
69|				Effect.mapError(MakeOutputProblem),

70|			),

71|
72|		Show: (channelName) =>
73|			IPCService.invoke(Channel.OutputShow)([channelName]).pipe(
74|				Effect.map(() => undefined as void),

75|
76|				Effect.mapError(MakeOutputProblem),

77|			),

78|
79|		Dispose: (channelName) =>
80|			IPCService.invoke(Channel.OutputDispose)([channelName]).pipe(
81|				Effect.map(() => {
82|					ActiveChannels.delete(channelName);

83|
84|					return undefined as void;

85|				}),

86|
87|				Effect.mapError(MakeOutputProblem),

88|			),

89|	};

90|
91|	return Service;

92|}

93|
94|export const LiveOutputServiceLayer = Layer.succeed(
95|	OutputServiceTag,

96|
97|	makeOutputService(),

98|);

99|
100|export default LiveOutputServiceLayer;

101|
