/**
 * @module Effect/Panel/Layer/PanelMock
 * @description
 * Mock layer for Panel service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Panel/Layer/PanelLive} Live layer
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { PanelService } from "../Interface/PanelService.js";
import PanelTag from "../Tag/PanelTag.js";
import type {
	CreatePanelView,
	PanelView,
	PanelViewType,
} from "../Type/PanelType.js";

/**
 * Creates a mock Panel service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Panel service instance
 */
const makeMockPanel = (): PanelService => ({
	createView: (view: CreatePanelView) =>
		Effect.succeed({
			...view,
			id: `mock-panel-${Date.now()}`,
		}),
	updateView: (_id: string, _updates: Partial<Omit<PanelView, "id">>) =>
		Effect.void,
	removeView: (_id: string) => Effect.void,
	getView: (_id: string) => Effect.succeed(undefined),
	views: Effect.succeed([]),
	viewsChanges: Stream.empty,
	setActiveView: (_id: string) => Effect.void,
	getActiveView: Effect.succeed(undefined),
	activeViewChanges: Stream.empty,
	showView: (_id: string) => Effect.void,
	hideView: (_id: string) => Effect.void,
	toggleView: (_id: string) => Effect.void,
	maximizeView: (_id: string) => Effect.void,
	restoreView: (_id: string) => Effect.void,
	getViewsByType: (_type: PanelViewType) => Effect.succeed([]),
	getVisibleViews: Effect.succeed([]),
	getMaximizedView: Effect.succeed(undefined),
});

/**
 * Mock layer for Panel service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { PanelMockLive } from "./Effect/Panel/Layer/PanelMock.js";
 *
 * const testLayer = PanelMockLive;
 * ```
 */
const PanelMockLive = Layer.succeed(PanelTag, makeMockPanel());

export default PanelMockLive;
export { makeMockPanel };
