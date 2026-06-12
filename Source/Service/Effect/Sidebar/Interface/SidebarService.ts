1|/**
2| * @module Effect/Sidebar/Interface/SidebarService
3| * @description
4| * Service interface for Sidebar management.
5| * Provides methods to manage VSCode sidebar panels.
6| * @see {@link Effect/Sidebar/Type/SidebarType} Type definitions
7| * @see {@link Effect/Sidebar/Tag/SidebarTag} Service tag
8| * @see {@link Effect/Sidebar/Layer/SidebarLive} Live implementation
9| * @category Interface
10| */
11|
13|
14|import type SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";

15|import type SidebarUpdateError from "../Error/SidebarUpdateError.js";

16|import type { CreateSidebarPanel, SidebarPanel } from "../Type/SidebarType.js";

17|
18|/**
19| * Sidebar service interface for managing VSCode sidebar panels.
20| * Provides CRUD operations, collapse/expand control, and stream-based reactivity.
21| */
22|export interface SidebarService {

23|	/** Create a new sidebar panel with auto-generated ID */
24|	readonly createPanel: (
25|		panel: CreateSidebarPanel,

26|	) => Effect.Effect<SidebarPanel, never>;

27|
28|	/** Update an existing sidebar panel */
29|	readonly updatePanel: (
30|		id: string,

31|
32|		updates: Partial<Omit<SidebarPanel, "id">>,

33|	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

34|
35|	/** Remove a sidebar panel */
36|	readonly removePanel: (
37|		id: string,

38|	) => Effect.Effect<void, SidebarPanelNotFoundError>;

39|
40|	/** Get a specific sidebar panel by ID */
41|	readonly getPanel: (
42|		id: string,

43|	) => Effect.Effect<SidebarPanel | undefined, never>;

44|
45|	/** Get all sidebar panels */
46|	readonly panels: Effect.Effect<ReadonlyArray<SidebarPanel>, never>;

47|
48|	/** Stream of sidebar panel changes for reactive updates */
49|	readonly panelsChanges: Stream.Stream<ReadonlyArray<SidebarPanel>, never>;

50|
51|	/** Set the active (focused) sidebar panel */
52|	readonly setActivePanel: (
53|		id: string,

54|	) => Effect.Effect<void, SidebarPanelNotFoundError>;

55|
56|	/** Get the currently active sidebar panel ID */
57|	readonly getActivePanel: Effect.Effect<string | undefined, never>;

58|
59|	/** Stream of active panel changes for reactive updates */
60|	readonly activePanelChanges: Stream.Stream<string | undefined, never>;

61|
62|	/** Toggle a sidebar panel's collapsed state */
63|	readonly togglePanel: (
64|		id: string,

65|	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

66|
67|	/** Collapse a sidebar panel */
68|	readonly collapsePanel: (
69|		id: string,

70|	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

71|
72|	/** Expand a sidebar panel */
73|	readonly expandPanel: (
74|		id: string,

75|	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

76|
77|	/** Get panels by position filter (left/right) */
78|	readonly getPanelsByPosition: (
79|		position: "left" | "right",

80|	) => Effect.Effect<ReadonlyArray<SidebarPanel>, never>;

81|}

82|
