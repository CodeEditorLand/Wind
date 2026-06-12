/**
 * @module Effect/ActivityBar/Layer/ActivityBarMock
 * @description
 * Mock implementation of the ActivityBar service.
 * Used in testing and development scenarios.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @category Layer
 */

import type { ActivityBarService } from "../Interface/ActivityBarService.js";
import type {
	ActivityBarBadge,
	ActivityBarItem,
	CreateActivityBarItem,
} from "../Type/ActivityBarType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Mock ActivityBar service.
 * Provides simple no-op implementation for testing.
 */
export const ActivityBarMockLive: ActivityBarService = {
	createItem: (item: CreateActivityBarItem) => ({
		...item,
		id: `mock-activitybar-${Date.now()}`,
	}),
	updateItem: (
		_id: string,

		_updates: Partial<Omit<ActivityBarItem, "id">>,
	) => {},
	removeItem: (_id: string) => {},
	getItem: (_id: string) => undefined,
	items: () => [],
	setActiveItem: (_id: string) => {},
	getActiveItem: () => undefined,
	setBadge: (_id: string, _badge: ActivityBarBadge | undefined) => {},
	getBadge: (_id: string) => undefined,
	clearBadge: (_id: string) => {},
} satisfies ActivityBarService;

export default ActivityBarMockLive;
