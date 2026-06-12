1|/**
2| * @module Effect/Sandbox/Layer/SandboxLive
3| * @description
4| * Live layer for Sandbox service.
5| * Provides access to VSCode preload globals from window.vscode.
6| * @see {\@link Effect/Sandbox/Interface/SandboxService} Service interface
7| * @see {\@link Effect/Sandbox/Layer/SandboxMock} Mock layer
8| * @category Layer
9| */
10|
12|
13|import {

14|	ConfigurationNotReadyError,

15|	SandboxNotReadyError,

16|	type IPCRenderer,

17|	type ISandboxConfiguration,

18|	type SandboxContext,

19|	type SandboxGlobals,

20|} from "../../../Types/Sandbox.js";

21|import type { SandboxService } from "../Interface/SandboxService.js";

22|import { Sandbox } from "../Tag/SandboxTag.js";

23|
24|/**
25| * Live layer for Sandbox service.
26| * Provides access to window.vscode preload globals with polling-based ready check.
27| *
28| * @example
29| * ```ts
31| * import { SandboxLive } from "./Service/Sandbox/Layer/SandboxLive.js";
32| *
33| * const appLayer = SandboxLive;
34| * ```
35| */
36|function makeSandboxService(): SandboxService {

37|	// Check if preload has run
38|	const checkReady = Effect.sync((): boolean => {
39|		const vscode = (window as any).vscode as SandboxGlobals | undefined;

40|
41|		return !!vscode && typeof vscode === "object";

42|	});

43|
44|	// Attempt to get globals
45|	const getGlobals = Effect.sync(() => {
46|		const vscode = (window as any).vscode as SandboxGlobals | undefined;

47|
48|		if (!vscode) throw new SandboxNotReadyError();

49|
50|		return vscode;

51|	}).pipe(Effect.mapError(() => new SandboxNotReadyError()));

52|
53|	// Await ready using polling (reliable across all environments)
54|	const awaitReady = Effect.gen(function* () {
55|		let attempts = 0;

56|
57|		const maxAttempts = 300; // 30 seconds at 100ms intervals

58|
59|		while (attempts < maxAttempts) {
60|			// Check if preloadGlobals exists (from Install.ts)
61|			const preloadGlobals = (window as any).preloadGlobals;

62|
63|			if (
64|				preloadGlobals &&
65|				preloadGlobals.process &&
66|				preloadGlobals.ipcRenderer
67|			) {
68|				// Now check for window.vscode
69|				const vscode = (window as any).vscode;

70|
71|				if (vscode) {
72|					return vscode;

73|				}

74|			}

75|
76|			attempts++;

77|
78|			yield* Effect.sleep("100 millis");

79|		}

80|
81|		throw new SandboxNotReadyError();

82|	}).pipe(
83|		Effect.timeout("30 seconds"),

84|
85|		Effect.mapError(() => new SandboxNotReadyError()),

86|	);

87|
88|	// Get IPC from globals
89|	const ipc = Effect.gen(function* () {
90|		const g = yield* getGlobals;

91|
92|		if (!g.ipcRenderer) {
93|			return yield* Effect.fail(new SandboxNotReadyError());

94|		}

95|
96|		return g.ipcRenderer as IPCRenderer;

97|	});

98|
99|	// Get configuration context
100|	const configuration = Effect.gen(function* () {
101|		const g = yield* getGlobals;

102|
103|		if (!g.context) {
104|			return yield* Effect.fail(new SandboxNotReadyError());

105|		}

106|
107|		return g.context as SandboxContext;

108|	});

109|
110|	// Resolve configuration with proper error handling
111|	const resolveConfiguration = Effect.gen(function* () {
112|		const ctx = yield* configuration;

113|
114|		return yield* Effect.tryPromise({
115|			try: () => ctx.resolveConfiguration(),
116|			catch: () => new ConfigurationNotReadyError(),
117|		});

118|	}).pipe(
119|		Effect.catchAll((error) =>
120|			error instanceof SandboxNotReadyError
121|				? Effect.fail(new ConfigurationNotReadyError())
122|				: Effect.fail(error as ConfigurationNotReadyError),

123|		),

124|	);

125|
126|	const service: SandboxService = {
127|		globals: getGlobals,

128|
129|		isReady: checkReady,

130|
131|		awaitReady,

132|
133|		ipc,

134|
135|		configuration,

136|
137|		resolveConfiguration,

138|	};

139|
140|	return service;

141|}

142|
143|const SandboxLive = Layer.succeed(
144|	Context.GenericTag<SandboxService>("Sandbox"),

145|
146|	makeSandboxService(),

147|);

148|
149|export default SandboxLive;

150|
