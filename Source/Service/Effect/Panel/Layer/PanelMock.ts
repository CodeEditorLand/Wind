/**
 * @module Effect/Panel/Layer/PanelMock
 * @description
 * Mock layer for Panel service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Panel/Layer/PanelLive} Live layer
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @category Layer
 */

import type { PanelService } from "../Interface/PanelService.js";
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
	createView: (view: CreatePanelView) => ({
		...view,
		id: `mock-panel-${Date.now()}`,
	}),
	updateView: (_id: string, _updates: Partial<Omit<PanelView, "id">>) => {},
	removeView: (_id: string) => {},
	getView: (_id: string) => undefined,
	views: [],
	onViewsChanges: (_listener) => () => {},
	setActiveView: (_id: string) => {},
	getActiveView: undefined,
	onActiveViewChanges: (_listener) => () => {},
	showView: (_id: string) => {},
	hideView: (_id: string) => {},
	toggleView: (_id: string) => {},
	maximizeView: (_id: string) => {},
	restoreView: (_id: string) => {},
	getViewsByType: (_type: PanelViewType) => [],
	getVisibleViews: [],
	getMaximizedView: undefined,
});

/**
 * Mock instance for Panel service.
 * Provides a no-op implementation for testing without dependencies.
 */
const PanelMockLive = makeMockPanel();

export default PanelMockLive;

export { makeMockPanel };
