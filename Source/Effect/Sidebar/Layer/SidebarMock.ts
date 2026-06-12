/**
 * @module Effect/Sidebar/Layer/SidebarMock
 * @description
 * Mock layer for Sidebar service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Sidebar/Layer/SidebarLive} Live layer
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { SidebarService } from "../Interface/SidebarService.js";

import SidebarTag from "../Tag/SidebarTag.js";

import type { CreateSidebarPanel, SidebarPanel } from "../Type/SidebarType.js";

/**
 * Creates a mock Sidebar service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Sidebar service instance
 */
const makeMockSidebar = (): SidebarService => ({
	createPanel: (panel: CreateSidebarPanel) =>
		Effect.succeed({
			...panel,
			id: `mock-sidebar-${Date.now()}`,
		}),
	updatePanel: (_id: string, _updates: Partial<Omit<SidebarPanel, "id">>) =>
		Effect.void,
	removePanel: (_id: string) => Effect.void,
	getPanel: (_id: string) => Effect.succeed(undefined),
	panels: Effect.succeed([]),
	panelsChanges: Stream.empty,
	setActivePanel: (_id: string) => Effect.void,
	getActivePanel: Effect.succeed(undefined),
	activePanelChanges: Stream.empty,
	togglePanel: (_id: string) => Effect.void,
	collapsePanel: (_id: string) => Effect.void,
	expandPanel: (_id: string) => Effect.void,
	getPanelsByPosition: (_position: "left" | "right") => Effect.succeed([]),
});

/**
 * Mock layer for Sidebar service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SidebarMockLive } from "./Effect/Sidebar/Layer/SidebarMock.js";
 *
 * const testLayer = SidebarMockLive;
 * ```
 */
const SidebarMockLive = Layer.succeed(SidebarTag, makeMockSidebar());

export default SidebarMockLive;

export { makeMockSidebar };
