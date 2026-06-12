1|/**
2| * @module Effect/Sidebar/Layer/SidebarMock
3| * @description
4| * Mock layer for Sidebar service.
5| * Provides a no-op implementation suitable for testing.
6| * @see {@link Effect/Sidebar/Layer/SidebarLive} Live layer
7| * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
8| * @category Layer
9| */
10|
12|
13|import type { SidebarService } from "../Interface/SidebarService.js";
14|import SidebarTag from "../Tag/SidebarTag.js";
15|import type { CreateSidebarPanel, SidebarPanel } from "../Type/SidebarType.js";
16|
17|/**
18| * Creates a mock Sidebar service implementation.
19| * All operations return static values suitable for testing.
20| *
21| * @returns Mock Sidebar service instance
22| */
23|const makeMockSidebar = (): SidebarService => ({
24|	createPanel: (panel: CreateSidebarPanel) =>
25|		Effect.succeed({
26|			...panel,
27|			id: `mock-sidebar-${Date.now()}`,
28|		}),
29|	updatePanel: (_id: string, _updates: Partial<Omit<SidebarPanel, "id">>) =>
30|		Effect.void,
31|	removePanel: (_id: string) => Effect.void,
32|	getPanel: (_id: string) => Effect.succeed(undefined),
33|	panels: Effect.succeed([]),
34|	panelsChanges: Stream.empty,
35|	setActivePanel: (_id: string) => Effect.void,
36|	getActivePanel: Effect.succeed(undefined),
37|	activePanelChanges: Stream.empty,
38|	togglePanel: (_id: string) => Effect.void,
39|	collapsePanel: (_id: string) => Effect.void,
40|	expandPanel: (_id: string) => Effect.void,
41|	getPanelsByPosition: (_position: "left" | "right") => Effect.succeed([]),
42|});
43|
44|/**
45| * Mock layer for Sidebar service.
46| * Provides a no-op implementation for testing without dependencies.
47| *
48| * @example
49| * ```ts
51| * import { SidebarMockLive } from "./Effect/Sidebar/Layer/SidebarMock.js";
52| *
53| * const testLayer = SidebarMockLive;
54| * ```
55| */
56|const SidebarMockLive = Layer.succeed(SidebarTag, makeMockSidebar());
57|
58|export default SidebarMockLive;
59|
60|export { makeMockSidebar };
61|
