/**
 * @module Effect/Panel
 * @description
 * Main re-export module for Panel service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Layer/PanelLive} Live layer
 * @see {@link Effect/Panel/Layer/PanelMock} Mock layer
 * @category Re-export
 */

// Types
export type {
	PanelView,
	CreatePanelView,
	PanelViewType,
} from "./Type/PanelType.js";

// Service interface
export type { PanelService } from "./Interface/PanelService.js";

// Layers
export { default as LivePanelService } from "./Layer/PanelLive.js";

export { default as PanelMockLive } from "./Layer/PanelMock.js";

// Mock factory (for direct usage without Layer)
export { makeMockPanel } from "./Layer/PanelMock.js";

// Errors
export { default as PanelViewNotFoundError } from "./Error/PanelViewNotFoundError.js";

export { default as PanelUpdateError } from "./Error/PanelUpdateError.js";
