/**
 * @module Effect/ActivityBar/Layer/ActivityBarMock
 * @description
 * Mock implementation layer for ActivityBar service.
 * Used in testing and development scenarios.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
import type { ActivityBarService } from "../Interface/ActivityBarService.js";
import type { CreateActivityBarItem } from "../Type/ActivityBarType.js";
import type { ActivityBarBadge } from "../Type/ActivityBarType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Mock implementation layer for ActivityBar service.
 * Provides simple no-op implementation for testing.
 */
export const ActivityBarMockLive = Layer.succeed(ActivityBarTag, {
	createItem: (item: CreateActivityBarItem) =>
		Effect.succeed({
			...item,
			id: `mock-activitybar-${Date.now()}`,
		}),
	updateItem: (_id: string, _updates: Partial<import("../Type/ActivityBarType.js").ActivityBarItem>) =>
		Effect.void,
	removeItem: (_id: string) => Effect.void,
	getItem: (_id: string) => Effect.succeed(undefined),
	items: Effect.succeed([]),
	itemsChanges: Stream.empty,
	setActiveItem: (_id: string) => Effect.void,
	getActiveItem: Effect.succeed(undefined),
	activeItemChanges: Stream.empty,
	setBadge: (_id: string, _badge: ActivityBarBadge | undefined) => Effect.void,
	getBadge: (_id: string) => Effect.succeed(undefined),
	clearBadge: (_id: string) => Effect.void,
} satisfies ActivityBarService);

export default ActivityBarMockLive;
