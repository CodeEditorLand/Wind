/**
 * @module Effect/ActivityBar/Implementation/ActivityBarHelper
 * @description
 * Helper functions for ActivityBar service implementation.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Main implementation
 * @category Implementation
 */

import { Context, Effect, SubscriptionRef } from "effect";

import type { ActivityBarBadge, ActivityBarItem, CreateActivityBarItem } from "../Type/ActivityBarType.js";
import { ActivityBarItemNotFoundError } from "../Error/ActivityBarItemNotFoundError.js";
import { ActivityBarUpdateError } from "../Error/ActivityBarUpdateError.js";
import type { TelemetryService } from "../../Telemetry.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique ID for activity bar items.
 */
export const generateItemId = (): string =>
	`activitybar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Creates the createItem effect implementation.
 */
export const makeCreateItem = (
	itemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
	telemetry: TelemetryService,
) => {
	return (item: CreateActivityBarItem): Effect.Effect<ActivityBarItem, never> =>
		Effect.gen(function* () {
			const id = generateItemId();
			const newItem: ActivityBarItem = { ...item, id };

			yield* SubscriptionRef.modify(itemsRef, (items) => [
				undefined,
				[...items, newItem].sort((a, b) => a.position - b.position),
			]);

			yield* telemetry.log("info", `Created activity bar item: ${id}`);
			return newItem;
		});
};

/**
 * Creates the updateItem effect implementation.
 */
export const makeUpdateItem = (
	itemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
	getItem: (id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
	telemetry: TelemetryService,
) => {
	return (
		id: string,
		updates: Partial<Omit<ActivityBarItem, "id">>,
	): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
		Effect.gen(function* () {
			const existing = yield* getItem(id);

			if (!existing) {
				return yield* Effect.fail(new ActivityBarItemNotFoundError(id));
			}

			try {
				// Remove badge if explicitly set to undefined
				const cleanUpdatesMap = new Map<string, unknown>();
				Object.entries(updates).forEach(([key, value]) => {
					if (key !== "badge" || value !== undefined) {
						cleanUpdatesMap.set(key, value);
					}
				});
				const cleanUpdates: Partial<Omit<ActivityBarItem, "id">> = Object.fromEntries(cleanUpdatesMap);

				yield* SubscriptionRef.modify(itemsRef, (items) => [
					undefined,
					items.map((item) =>
						item.id === id ? { ...item, ...cleanUpdates } : item,
					).sort((a, b) => a.position - b.position),
				]);

				yield* telemetry.log("info", `Updated activity bar item: ${id}`);
			} catch (error) {
				return yield* Effect.fail(new ActivityBarUpdateError(id, error));
			}
		});
};

/**
 * Creates the removeItem effect implementation.
 */
export const makeRemoveItem = (
	itemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
	activeItemRef: SubscriptionRef.SubscriptionRef<string | undefined>,
	getItem: (id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
	telemetry: TelemetryService,
) => {
	return (id: string): Effect.Effect<void, ActivityBarItemNotFoundError> =>
		Effect.gen(function* () {
			const existing = yield*getItem(id);

			if (!existing) {
				return yield* Effect.fail(new ActivityBarItemNotFoundError(id));
			}

			yield* SubscriptionRef.modify(itemsRef, (items) => [
				undefined,
				items.filter((item) => item.id !== id),
			]);

			// Clear active state if this was the active item
			const currentActive = yield* activeItemRef.get;
			if (currentActive === id) {
				yield* SubscriptionRef.set(activeItemRef, undefined);
			}

			yield* telemetry.log("info", `Removed activity bar item: ${id}`);
		});
};

/**
 * Creates the getItem effect implementation.
 */
export const makeGetItem = (
	itemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
) => {
	return (id: string): Effect.Effect<ActivityBarItem | undefined, never> =>
		Effect.map(itemsRef.get, (items) => items.find((item) => item.id === id));
};

/**
 * Creates the setActiveItem effect implementation.
 */
export const makeSetActiveItem = (
	activeItemRef: SubscriptionRef.SubscriptionRef<string | undefined>,
	getItem: (id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
	telemetry: TelemetryService,
) => {
	return (id: string): Effect.Effect<void, ActivityBarItemNotFoundError> =>
		Effect.gen(function* () {
			const existing = yield* getItem(id);

			if (!existing) {
				return yield* Effect.fail(new ActivityBarItemNotFoundError(id));
			}

			yield* SubscriptionRef.set(activeItemRef, id);
			yield* telemetry.log("info", `Set active activity bar item: ${id}`);
		});
};

/**
 * Creates the setBadge effect implementation.
 */
export const makeSetBadge = (
	updateItem: (
		id: string,
		updates: Partial<Omit<ActivityBarItem, "id">>,
	) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>,
) => {
	return (
		id: string,
		badge: ActivityBarBadge | undefined,
	): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
		badge === undefined
			? updateItem(id, {} as Partial<Omit<ActivityBarItem, "id">>) // badge removed by helper
			: updateItem(id, { badge });
};

/**
 * Creates the getBadge effect implementation.
 */
export const makeGetBadge = (
	getItem: (id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
) => {
	return (id: string): Effect.Effect<ActivityBarBadge | undefined, never> =>
		Effect.map(getItem(id), (item) => item?.badge);
};

export default {
	makeCreateItem,
	makeUpdateItem,
	makeRemoveItem,
	makeGetItem,
	makeSetActiveItem,
	makeSetBadge,
	makeGetBadge,
	generateItemId,
};
