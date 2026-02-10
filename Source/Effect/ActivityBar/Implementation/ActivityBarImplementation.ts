/**
 * @module Effect/ActivityBar/Implementation/ActivityBarImplementation
 * @description
 * Main implementation of ActivityBar service using reactive subscriptions.
 * Provides production-ready implementation with telemetry support.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */

import { Effect, Layer, SubscriptionRef } from "effect";

import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
import type { ActivityBarService } from "../Interface/ActivityBarService.js";
import type { ActivityBarItem } from "../Type/ActivityBarType.js";
import type { CreateActivityBarItem } from "../Type/ActivityBarType.js";
import type { ActivityBarBadge } from "../Type/ActivityBarType.js";
import { Telemetry } from "../../Telemetry.js";
import {
	makeCreateItem,
	makeUpdateItem,
	makeRemoveItem,
	makeGetItem,
	makeSetActiveItem,
	makeSetBadge,
	makeGetBadge,
} from "./ActivityBarHelper.js";

// ============================================================================
// Live Implementation
// ============================================================================

/**
 * Live implementation layer for ActivityBar service.
 * Provides in-memory storage with reactive state management.
 */
export const ActivityBarLive = Layer.effect(
	ActivityBarTag,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of activity bar items as reactive ref
		const itemsRef = yield* SubscriptionRef.make<ReadonlyArray<ActivityBarItem>>([]);

		// Active item state as reactive ref
		const activeItemRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Get a specific activity bar item
		const getItem = makeGetItem(itemsRef);

		// Atom: Create a new activity bar item
		const createItem = makeCreateItem(itemsRef, telemetry);

		// Atom: Update an existing activity bar item
		const updateItem = makeUpdateItem(itemsRef, getItem, telemetry);

		// Atom: Remove an activity bar item
		const removeItem = makeRemoveItem(itemsRef, activeItemRef, getItem, telemetry);

		// Atom: Set active item
		const setActiveItem = makeSetActiveItem(activeItemRef, getItem, telemetry);

		// Atom: Set badge
		const setBadge = makeSetBadge(updateItem);

		// Atom: Get badge
		const getBadge = makeGetBadge(getItem);

		yield* telemetry.log("info", "ActivityBar service initialized");

		return {
			createItem,
			updateItem,
			removeItem,
			getItem,
			items: itemsRef.get,
			itemsChanges: itemsRef.changes,
			setActiveItem,
			getActiveItem: activeItemRef.get,
			activeItemChanges: activeItemRef.changes,
			setBadge,
			getBadge,
			clearBadge: (id: string) => setBadge(id, undefined),
		} satisfies ActivityBarService;
	}),
);

export default ActivityBarLive;
