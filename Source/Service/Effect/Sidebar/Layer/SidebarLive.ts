1|/**
2| * @module Effect/Sidebar/Layer/SidebarLive
3| * @description
4| * Live layer for Sidebar service - plain mutable state, no Effect-TS runtime.
5| * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
6| * @category Layer
7| */
8|
10|
11|import SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";

12|import SidebarUpdateError from "../Error/SidebarUpdateError.js";

13|import type { SidebarService } from "../Interface/SidebarService.js";

14|import SidebarTag from "../Tag/SidebarTag.js";

15|import type { CreateSidebarPanel, SidebarPanel } from "../Type/SidebarType.js";

16|
17|function makeService(): SidebarService {

18|	let _panels: ReadonlyArray<SidebarPanel> = [];

19|
20|	let _activePanel: string | undefined = undefined;

21|
22|	const _panelsListeners: ((v: ReadonlyArray<SidebarPanel>) => void)[] = [];

23|
24|	const _activeListeners: ((v: string | undefined) => void)[] = [];

25|
26|	const GetPanel = (Id: string): Effect.Effect<SidebarPanel | undefined> =>
27|		Effect.succeed(_panels.find((p) => p.id === Id));

28|
29|	const Panels = Effect.suspend(() => Effect.succeed(_panels));

30|
31|	const PanelsChanges: Stream.Stream<ReadonlyArray<SidebarPanel>> =
32|		Stream.asyncInterrupt<ReadonlyArray<SidebarPanel>>((emit) => {
33|			const fn = (v: ReadonlyArray<SidebarPanel>) => emit.single(v);

34|
35|			_panelsListeners.push(fn);

36|
37|			return Either.left(
38|				Effect.sync(() => {
39|					const i = _panelsListeners.indexOf(fn);

40|
41|					if (i >= 0) _panelsListeners.splice(i, 1);

42|				}),

43|			);

44|		});

45|
46|	const ActivePanelChanges: Stream.Stream<string | undefined> =
47|		Stream.asyncInterrupt<string | undefined>((emit) => {
48|			const fn = (v: string | undefined) => emit.single(v);

49|
50|			_activeListeners.push(fn);

51|
52|			return Either.left(
53|				Effect.sync(() => {
54|					const i = _activeListeners.indexOf(fn);

55|
56|					if (i >= 0) _activeListeners.splice(i, 1);

57|				}),

58|			);

59|		});

60|
61|	const GetActivePanel: Effect.Effect<string | undefined> = Effect.suspend(
62|		() => Effect.succeed(_activePanel),

63|	);

64|
65|	const CreatePanel = (
66|		Panel: CreateSidebarPanel,

67|	): Effect.Effect<SidebarPanel> =>
68|		Effect.sync(() => {
69|			const Id = `sidebar-${Date.now()}-${Math.random()
70|				.toString(36)
71|				.substring(2, 9)}`;

72|
73|			const NewPanel: SidebarPanel = { ...Panel, id: Id };

74|
75|			_panels = [..._panels, NewPanel].sort(
76|				(a, b) => a.priority - b.priority,

77|			);

78|
79|			_panelsListeners.forEach((fn) => fn(_panels));

80|
81|			return NewPanel;

82|		});

83|
84|	const UpdatePanel = (
85|		Id: string,

86|
87|		updates: Partial<Omit<SidebarPanel, "id">>,

88|	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> => {
89|		const existing = _panels.find((p) => p.id === Id);

90|
91|		if (!existing) return Effect.fail(new SidebarPanelNotFoundError(Id));

92|
93|		try {
94|			_panels = _panels
95|				.map((p) => (p.id === Id ? { ...p, ...updates } : p))

96|				.sort((a, b) => a.priority - b.priority);

97|
98|			_panelsListeners.forEach((fn) => fn(_panels));

99|
100|			return Effect.void;

101|		} catch (error) {
102|			return Effect.fail(new SidebarUpdateError(Id, error));

103|		}

104|	};

105|
106|	const RemovePanel = (
107|		Id: string,

108|	): Effect.Effect<void, SidebarPanelNotFoundError> => {
109|		if (!_panels.find((p) => p.id === Id))

110|			return Effect.fail(new SidebarPanelNotFoundError(Id));

111|
112|		_panels = _panels.filter((p) => p.id !== Id);

113|
114|		if (_activePanel === Id) {
115|			_activePanel = undefined;

116|
117|			_activeListeners.forEach((fn) => fn(undefined));

118|		}

119|
120|		_panelsListeners.forEach((fn) => fn(_panels));

121|
122|		return Effect.void;

123|	};

124|
125|	const SetActivePanel = (
126|		Id: string,

127|	): Effect.Effect<void, SidebarPanelNotFoundError> => {
128|		if (!_panels.find((p) => p.id === Id))

129|			return Effect.fail(new SidebarPanelNotFoundError(Id));

130|
131|		_panels = _panels.map((p) =>
132|			p.id === Id ? { ...p, collapsed: false } : p,

133|		);

134|
135|		_activePanel = Id;

136|
137|		_activeListeners.forEach((fn) => fn(Id));

138|
139|		_panelsListeners.forEach((fn) => fn(_panels));

140|
141|		return Effect.void;

142|	};

143|
144|	const TogglePanel = (
145|		Id: string,

146|	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> => {
147|		const existing = _panels.find((p) => p.id === Id);

148|
149|		if (!existing) return Effect.fail(new SidebarPanelNotFoundError(Id));

150|
151|		return UpdatePanel(Id, { collapsed: !existing.collapsed });

152|	};

153|
154|	const CollapsePanel = (
155|		Id: string,

156|	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
157|		UpdatePanel(Id, { collapsed: true });

158|
159|	const ExpandPanel = (
160|		Id: string,

161|	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
162|		UpdatePanel(Id, { collapsed: false });

163|
164|	const GetPanelsByPosition = (
165|		Position: "left" | "right",

166|	): Effect.Effect<ReadonlyArray<SidebarPanel>> =>
167|		Effect.succeed(_panels.filter((p) => p.position === Position));

168|
169|	return {
170|		createPanel: CreatePanel,

171|
172|		updatePanel: UpdatePanel,

173|
174|		removePanel: RemovePanel,

175|
176|		getPanel: GetPanel,

177|
178|		panels: Panels,

179|
180|		panelsChanges: PanelsChanges,

181|
182|		setActivePanel: SetActivePanel,

183|
184|		getActivePanel: GetActivePanel,

185|
186|		activePanelChanges: ActivePanelChanges,

187|
188|		togglePanel: TogglePanel,

189|
190|		collapsePanel: CollapsePanel,

191|
192|		expandPanel: ExpandPanel,

193|
194|		getPanelsByPosition: GetPanelsByPosition,

195|	} satisfies SidebarService;

196|}

197|
198|const SidebarLive = Layer.succeed(SidebarTag, makeService());

199|
200|export default SidebarLive;

201|
