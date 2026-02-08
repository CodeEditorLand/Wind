/**
 * @module Effect/StatusBar
 * @description
 * Atomic Status Bar service using Effect-TS.
 * Manages status bar items, their display, and updates.
 */

import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";

import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Status Bar Error Types
// ============================================================================

export class StatusBarItemNotFoundError extends Error {
	readonly _tag = "StatusBarItemNotFoundError";
	constructor(readonly itemId: string) {
		super(`Status bar item '${itemId}' not found`);
		Object.setPrototypeOf(this, StatusBarItemNotFoundError.prototype);
	}
	override get name() { return "StatusBarItemNotFoundError"; }
}

export class StatusBarUpdateError extends Error {
	readonly _tag = "StatusBarUpdateError";
	constructor(readonly itemId: string, override readonly cause: unknown) {
		super(`Failed to update status bar item '${itemId}': ${String(cause)}`);
		Object.setPrototypeOf(this, StatusBarUpdateError.prototype);
	}
	override get name() { return "StatusBarUpdateError"; }
}

// ============================================================================
// Status Bar Item Types
// ============================================================================

export interface StatusBarItem {
	readonly id: string;
	readonly text: string;
	readonly alignment: "left" | "right";
	readonly priority: number;
	readonly color?: string;
	readonly backgroundColor?: string;
	readonly tooltip?: string;
	readonly command?: string;
	readonly icon?: string;
}

export type CreateStatusBarItem = Omit<StatusBarItem, "id">;

// ============================================================================
// Status Bar Service Interface
// ============================================================================

export interface StatusBarService {
	/** Create a new status bar item */
	readonly createItem: (
		item: CreateStatusBarItem,
	) => Effect.Effect<StatusBarItem, never>;

	/** Update an existing status bar item */
	readonly updateItem: (
		id: string,
		updates: Partial<Omit<StatusBarItem, "id">>,
	) => Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError>;

	/** Remove a status bar item */
	readonly removeItem: (
		id: string,
	) => Effect.Effect<void, StatusBarItemNotFoundError>;

	/** Get a specific status bar item by ID */
	readonly getItem: (
		id: string,
	) => Effect.Effect<StatusBarItem | undefined, never>;

	/** Get all status bar items */
	readonly items: Effect.Effect<ReadonlyArray<StatusBarItem>, never>;

	/** Stream of status bar item changes */
	readonly itemsChanges: Stream.Stream<ReadonlyArray<StatusBarItem>, never>;

	/** Set the visibility of a status bar item */
	readonly setItemVisibility: (
		id: string,
		visible: boolean,
	) => Effect.Effect<void, StatusBarItemNotFoundError>;

	/** Get the text of a status bar item */
	readonly getItemText: (
		id: string,
	) => Effect.Effect<string | undefined, never>;

	/** Set the text of a status bar item */
	readonly setItemText: (
		id: string,
		text: string,
	) => Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError>;
}

// Tag for dependency injection
export class StatusBarTag extends Context.Tag("StatusBar")<StatusBarTag, StatusBarService>() {}

export const StatusBar = StatusBarTag;

// ============================================================================
// Implementation
// ============================================================================

export const StatusBarLive = Layer.effect(
	StatusBar,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of status bar items as reactive ref
		const itemsRef = yield* SubscriptionRef.make<ReadonlyArray<StatusBarItem>>([]);

		// Atom: Create a new status bar item
		const createItem = (
			item: CreateStatusBarItem,
		): Effect.Effect<StatusBarItem, never> =>
			Effect.gen(function* () {
				const id = `statusbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newItem: StatusBarItem = { ...item, id };

				yield* SubscriptionRef.modify(itemsRef, (items) => [
					undefined,
					[...items, newItem].sort((a, b) => a.priority - b.priority),
				]);

				yield* telemetry.log("info", `Created status bar item: ${id}`);
				return newItem;
			});

		// Atom: Update an existing status bar item
		const updateItem = (
			id: string,
			updates: Partial<Omit<StatusBarItem, "id">>,
		): Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new StatusBarItemNotFoundError(id));
				}

				try {
					yield* SubscriptionRef.modify(itemsRef, (items) => [
						undefined,
						items.map((item) =>
							item.id === id ? { ...item, ...updates } : item,
						).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated status bar item: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new StatusBarUpdateError(id, error));
				}
			});

		// Atom: Remove a status bar item
		const removeItem = (
			id: string,
		): Effect.Effect<void, StatusBarItemNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new StatusBarItemNotFoundError(id));
				}

				yield* SubscriptionRef.modify(itemsRef, (items) => [
					undefined,
					items.filter((item) => item.id !== id),
				]);

				yield* telemetry.log("info", `Removed status bar item: ${id}`);
			});

		// Atom: Get a specific status bar item
		const getItem = (
			id: string,
		): Effect.Effect<StatusBarItem | undefined, never> =>
			Effect.map(itemsRef.get, (items) => items.find((item) => item.id === id));

		// Atom: Get all status bar items
		const items = itemsRef.get;

		// Atom: Stream of items changes
		const itemsChanges = itemsRef.changes;

		// Atom: Set item visibility
		const setItemVisibility = (
			id: string,
			visible: boolean,
		): Effect.Effect<void, StatusBarItemNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new StatusBarItemNotFoundError(id));
				}

				// Visibility is managed via presence in the items array
				if (!visible) {
					yield* removeItem(id);
				} else {
					// Item is already visible if it exists
					yield* Effect.void;
				}
			});

		// Atom: Get item text
		const getItemText = (
			id: string,
		): Effect.Effect<string | undefined, never> =>
			Effect.map(getItem(id), (item) => item?.text);

		// Atom: Set item text
		const setItemText = (
			id: string,
			text: string,
		): Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError> =>
			updateItem(id, { text });

		yield* telemetry.log("info", "StatusBar service initialized");

		return {
			createItem,
			updateItem,
			removeItem,
			getItem,
			items,
			itemsChanges,
			setItemVisibility,
			getItemText,
			setItemText,
		};
	}),
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

export const StatusBarMockLive = Layer.succeed(StatusBar, {
	createItem: (item: CreateStatusBarItem) =>
		Effect.succeed({
			...item,
			id: `mock-statusbar-${Date.now()}`,
		}),
	updateItem: (_id: string, _updates: Partial<Omit<StatusBarItem, "id">>) =>
		Effect.void,
	removeItem: (_id: string) => Effect.void,
	getItem: (_id: string) => Effect.succeed(undefined),
	items: Effect.succeed([]),
	itemsChanges: Stream.empty,
	setItemVisibility: (_id: string, _visible: boolean) => Effect.void,
	getItemText: (_id: string) => Effect.succeed(undefined),
	setItemText: (_id: string, _text: string) => Effect.void,
});
