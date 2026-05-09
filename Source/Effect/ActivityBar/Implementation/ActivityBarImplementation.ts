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

import { Telemetry } from "../../Telemetry.js";
import type { ActivityBarService } from "../Interface/ActivityBarService.js";
import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
import type {
	ActivityBarBadge,
	ActivityBarItem,
	CreateActivityBarItem,
} from "../Type/ActivityBarType.js";
import {
	MakeCreateItem,
	MakeGetBadge,
	MakeGetItem,
	MakeRemoveItem,
	MakeSetActiveItem,
	MakeSetBadge,
	MakeUpdateItem,
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
		const TelemetryService = yield* Telemetry;

		// In-memory storage of activity bar items as reactive ref
		const ItemsRef = yield* SubscriptionRef.make<
			ReadonlyArray<ActivityBarItem>
		>([]);

		// Active item state as reactive ref
		const ActiveItemRef = yield* SubscriptionRef.make<string | undefined>(
			undefined,
		);

		// Atom: Get a specific activity bar item
		const GetItem = MakeGetItem(ItemsRef);

		// Atom: Create a new activity bar item
		const CreateItem = MakeCreateItem(ItemsRef, TelemetryService);

		// Atom: Update an existing activity bar item
		const UpdateItem = MakeUpdateItem(ItemsRef, GetItem, TelemetryService);

		// Atom: Remove an activity bar item
		const RemoveItem = MakeRemoveItem(
			ItemsRef,

			ActiveItemRef,

			GetItem,

			TelemetryService,
		);

		// Atom: Set active item
		const SetActiveItem = MakeSetActiveItem(
			ActiveItemRef,

			GetItem,

			TelemetryService,
		);

		// Atom: Set badge
		const SetBadge = MakeSetBadge(UpdateItem);

		// Atom: Get badge
		const GetBadge = MakeGetBadge(GetItem);

		yield* TelemetryService.log("info", "ActivityBar service initialized");

		return {
			createItem: CreateItem,
			updateItem: UpdateItem,
			removeItem: RemoveItem,
			getItem: GetItem,
			items: ItemsRef.get,
			itemsChanges: ItemsRef.changes,
			setActiveItem: SetActiveItem,
			getActiveItem: ActiveItemRef.get,
			activeItemChanges: ActiveItemRef.changes,
			setBadge: SetBadge,
			getBadge: GetBadge,
			clearBadge: (Id: string) => SetBadge(Id, undefined),
		} satisfies ActivityBarService;
	}),
);

export default ActivityBarLive;
