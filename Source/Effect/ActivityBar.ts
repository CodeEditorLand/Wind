/**
 * @module Effect/ActivityBar
 * @description
 * Atomic Activity Bar service using Effect-TS.
 * Manages activity bar items, their display, and active state.
 */

import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";

import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Activity Bar Error Types
// ============================================================================

export class ActivityBarItemNotFoundError extends Error {
	readonly _tag = "ActivityBarItemNotFoundError";
	constructor(itemId: string) {
		super(`Activity bar item '${itemId}' not found`);
		Object.setPrototypeOf(this, ActivityBarItemNotFoundError.prototype);
	}
	override get name() { return "ActivityBarItemNotFoundError"; }
}

export class ActivityBarUpdateError extends Error {
	readonly _tag = "ActivityBarUpdateError";
	constructor(itemId: string, cause: unknown) {
		super(`Failed to update activity bar item '${itemId}': ${String(cause)}`);
		this.cause = cause;
		Object.setPrototypeOf(this, ActivityBarUpdateError.prototype);
	}
	override get name() { return "ActivityBarUpdateError"; }
}

// ============================================================================
// Activity Bar Item Types
// ============================================================================

export interface ActivityBarBadge {
	readonly text: string;
	readonly color?: string;
}

export interface ActivityBarItem {
	readonly id: string;
	readonly title: string;
	readonly icon: string;
	readonly command: string;
	readonly position: number;
	readonly badge?: ActivityBarBadge;
}

export type CreateActivityBarItem = Omit<ActivityBarItem, "id">;

// ============================================================================
// Activity Bar Service Interface
// ============================================================================

export interface ActivityBarService {
	/** Create a new activity bar item */
	readonly createItem: (
		item: CreateActivityBarItem,
	) => Effect.Effect<ActivityBarItem, never>;

	/** Update an existing activity bar item */
	readonly updateItem: (
		id: string,
		updates: Partial<Omit<ActivityBarItem, "id">>,
	) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;

	/** Remove an activity bar item */
	readonly removeItem: (
		id: string,
	) => Effect.Effect<void, ActivityBarItemNotFoundError>;

	/** Get a specific activity bar item by ID */
	readonly getItem: (
		id: string,
	) => Effect.Effect<ActivityBarItem | undefined, never>;

	/** Get all activity bar items */
	readonly items: Effect.Effect<ReadonlyArray<ActivityBarItem>, never>;

	/** Stream of activity bar item changes */
	readonly itemsChanges: Stream.Stream<ReadonlyArray<ActivityBarItem>, never>;

	/** Set the active activity bar item */
	readonly setActiveItem: (
		id: string,
	) => Effect.Effect<void, ActivityBarItemNotFoundError>;

	/** Get the currently active activity bar item ID */
	readonly getActiveItem: Effect.Effect<string | undefined, never>;

	/** Stream of active item changes */
	readonly activeItemChanges: Stream.Stream<string | undefined, never>;

	/** Set badge for an activity bar item */
	readonly setBadge: (
		id: string,
		badge: ActivityBarBadge | undefined,
	) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;

	/** Get badge for an activity bar item */
	readonly getBadge: (
		id: string,
	) => Effect.Effect<ActivityBarBadge | undefined, never>;

	/** Clear badge for an activity bar item */
	readonly clearBadge: (
		id: string,
	) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
}

// Tag for dependency injection
export class ActivityBarTag extends Context.Tag("ActivityBar")<ActivityBarTag, ActivityBarService>() {}

export const ActivityBar = ActivityBarTag;

// ============================================================================
// Implementation
// ============================================================================

export const ActivityBarLive = Layer.effect(
	ActivityBar,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of activity bar items as reactive ref
		const itemsRef = yield* SubscriptionRef.make<ReadonlyArray<ActivityBarItem>>([]);

		// Active item state as reactive ref
		const activeItemRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new activity bar item
		const createItem = (
			item: CreateActivityBarItem,
		): Effect.Effect<ActivityBarItem, never> =>
			Effect.gen(function* () {
				const id = `activitybar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newItem: ActivityBarItem = { ...item, id };

				yield* SubscriptionRef.modify(itemsRef, (items) => [
					undefined,
					[...items, newItem].sort((a, b) => a.position - b.position),
				]);

				yield* telemetry.log("info", `Created activity bar item: ${id}`);
				return newItem;
			});

		// Atom: Update an existing activity bar item
		const updateItem = (
			id: string,
			updates: Partial<Omit<ActivityBarItem, "id">>,
		): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new ActivityBarItemNotFoundError(id));
				}

				try {
					yield* SubscriptionRef.modify(itemsRef, (items) => [
						undefined,
						items.map((item) =>
							item.id === id ? { ...item, ...updates } : item,
						).sort((a, b) => a.position - b.position),
					]);

					yield* telemetry.log("info", `Updated activity bar item: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new ActivityBarUpdateError(id, error));
				}
			});

		// Atom: Remove an activity bar item
		const removeItem = (
			id: string,
		): Effect.Effect<void, ActivityBarItemNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

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

		// Atom: Get a specific activity bar item
		const getItem = (
			id: string,
		): Effect.Effect<ActivityBarItem | undefined, never> =>
			Effect.map(itemsRef.get, (items) => items.find((item) => item.id === id));

		// Atom: Get all activity bar items
		const items = itemsRef.get;

		// Atom: Stream of items changes
		const itemsChanges = itemsRef.changes;

		// Atom: Set active item
		const setActiveItem = (
			id: string,
		): Effect.Effect<void, ActivityBarItemNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new ActivityBarItemNotFoundError(id));
				}

				yield* SubscriptionRef.set(activeItemRef, id);
				yield* telemetry.log("info", `Set active activity bar item: ${id}`);
			});

		// Atom: Get active item
		const getActiveItem = activeItemRef.get;

		// Atom: Stream of active item changes
		const activeItemChanges = activeItemRef.changes;

		// Atom: Set badge
		const setBadge = (
			id: string,
			badge: ActivityBarBadge | undefined,
		): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
			badge === undefined
				? updateItem(id, { badge: undefined as ActivityBarBadge | undefined })
				: updateItem(id, { badge });

		// Atom: Get badge
		const getBadge = (
			id: string,
		): Effect.Effect<ActivityBarBadge | undefined, never> =>
			Effect.map(getItem(id), (item) => item?.badge);

		// Atom: Clear badge
		const clearBadge = (
			id: string,
		): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
			setBadge(id, undefined);

		yield* telemetry.log("info", "ActivityBar service initialized");

		return {
			createItem,
			updateItem,
			removeItem,
			getItem,
			items,
			itemsChanges,
			setActiveItem,
			getActiveItem,
			activeItemChanges,
			setBadge,
			getBadge,
			clearBadge,
		};
	}),
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

export const ActivityBarMockLive = Layer.succeed(ActivityBar, {
	createItem: (item: CreateActivityBarItem) =>
		Effect.succeed({
			...item,
			id: `mock-activitybar-${Date.now()}`,
		}),
	updateItem: (_id: string, _updates: Partial<Omit<ActivityBarItem, "id">>) =>
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
});
