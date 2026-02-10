/**
 * @module Effect/StatusBar/Layer/StatusBarLive
 * @description
 * Live layer for StatusBar service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarMock} Mock layer
 * @category Layer
 */

import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import StatusBarTag from "../Tag/StatusBarTag.js";
import type { StatusBarService } from "../Interface/StatusBarService.js";
import type { StatusBarItem, CreateStatusBarItem } from "../Type/StatusBarType.js";
import StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";
import StatusBarUpdateError from "../Error/StatusBarUpdateError.js";
import { Telemetry } from "../../Telemetry.js";

/**
 * Live layer for StatusBar service.
 * Provides reactive status bar item management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { StatusBarLive } from "./Effect/StatusBar/Layer/StatusBarLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, StatusBarLive);
 * ```
 */
const StatusBarLive = Layer.effect(
	StatusBarTag,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of status bar items as reactive ref
		const itemsRef = yield* SubscriptionRef.make<ReadonlyArray<StatusBarItem>>([]);

		// Atom: Create a new status bar item
		const createItem = (item: CreateStatusBarItem): Effect.Effect<StatusBarItem, never> =>
			Effect.gen(function* () {
				const id = `statusbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newItem: StatusBarItem = { ...item, id };

				yield* SubscriptionRef.modify(itemsRef, (items) => [undefined, [...items, newItem].sort((a, b) => a.priority - b.priority)]);

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
						items.map((item) => (item.id === id ? { ...item, ...updates } : item)).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated status bar item: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new StatusBarUpdateError(id, error));
				}
			});

		// Atom: Remove a status bar item
		const removeItem = (id: string): Effect.Effect<void, StatusBarItemNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getItem(id);

				if (!existing) {
					return yield* Effect.fail(new StatusBarItemNotFoundError(id));
				}

				yield* SubscriptionRef.modify(itemsRef, (items) => [undefined, items.filter((item) => item.id !== id)]);

				yield* telemetry.log("info", `Removed status bar item: ${id}`);
			});

		// Atom: Get a specific status bar item
		const getItem = (id: string): Effect.Effect<StatusBarItem | undefined, never> =>
			Effect.map(itemsRef.get, (items) => items.find((item) => item.id === id));

		// Atom: Get all status bar items
		const items = itemsRef.get;

		// Atom: Stream of items changes
		const itemsChanges = itemsRef.changes;

		// Atom: Set item visibility
		const setItemVisibility = (id: string, visible: boolean): Effect.Effect<void, StatusBarItemNotFoundError> =>
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
		const getItemText = (id: string): Effect.Effect<string | undefined, never> => Effect.map(getItem(id), (item) => item?.text);

		// Atom: Set item text
		const setItemText = (id: string, text: string): Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError> => updateItem(id, { text });

		yield* telemetry.log("info", "StatusBar service initialized");

		const service: StatusBarService = {
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

		return service;
	}),
);

export default StatusBarLive;
