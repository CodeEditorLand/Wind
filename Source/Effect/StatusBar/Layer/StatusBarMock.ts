/**
 * @module Effect/StatusBar/Layer/StatusBarMock
 * @description
 * Mock layer for StatusBar service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live layer
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @category Layer
 */

import type { StatusBarService } from "../Interface/StatusBarService.js";
import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

/**
 * Creates a mock StatusBar service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock StatusBar service instance
 */
const makeMockStatusBar = (): StatusBarService => ({
	createItem: (item: CreateStatusBarItem) => ({
		...item,
		id: `mock-statusbar-${Date.now()}`,
	}),
	updateItem: (_id: string, _updates: Partial<Omit<StatusBarItem, "id">>) => {},
	removeItem: (_id: string) => {},
	getItem: (_id: string) => undefined,
	items: [],
	onItemsChanges: (_listener) => () => {},
	setItemVisibility: (_id: string, _visible: boolean) => {},
	getItemText: (_id: string) => undefined,
	setItemText: (_id: string, _text: string) => {},
});

/**
 * Mock instance for StatusBar service.
 * Provides a no-op implementation for testing without dependencies.
 */
const StatusBarMockLive = makeMockStatusBar();

export default StatusBarMockLive;

export { makeMockStatusBar };
