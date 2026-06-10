/**
 * @module Effect/StatusBar/Layer/StatusBarLive
 * @description
 * Live layer for StatusBar service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarMock} Mock layer
 * @category Layer
 */

import { Effect, Layer, SubscriptionRef } from "effect";

import { makeMockTelemetry } from "../../Telemetry/Layer/TelemetryMock.js";

import StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";

import StatusBarUpdateError from "../Error/StatusBarUpdateError.js";

import type { StatusBarService } from "../Interface/StatusBarService.js";

import StatusBarTag from "../Tag/StatusBarTag.js";

import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

/**
 * Factory for StatusBarService - synchronous, no Effect layer deps.
 */
function makeStatusBarService(): StatusBarService {
	const Globals = globalThis as any;

	const TelemetryService =
		Globals.__CEL_SERVICES__?.Telemetry ?? makeMockTelemetry();

	// In-memory storage of status bar items as reactive ref
	const ItemsRef = Effect.runSync(
		SubscriptionRef.make<ReadonlyArray<StatusBarItem>>([]),
	);

	// Atom: Create a new status bar item
	const CreateItem = (
		Item: CreateStatusBarItem,
	): Effect.Effect<StatusBarItem, never> =>
		Effect.gen(function* () {
			const Id = `statusbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			const NewItem: StatusBarItem = { ...Item, id: Id };

			yield* SubscriptionRef.modify(ItemsRef, (Items) => [
				undefined,

				[...Items, NewItem].sort((a, b) => a.priority - b.priority),
			]);

			yield* TelemetryService.log(
				"info",

				`Created status bar item: ${Id}`,
			);

			return NewItem;
		});

	// Atom: Update an existing status bar item
	const UpdateItem = (
		Id: string,

		updates: Partial<Omit<StatusBarItem, "id">>,
	): Effect.Effect<
		void,

		StatusBarItemNotFoundError | StatusBarUpdateError
	> =>
		Effect.gen(function* () {
			const Existing = yield* GetItem(Id);

			if (!Existing) {
				return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
			}

			try {
				yield* SubscriptionRef.modify(ItemsRef, (Items) => [
					undefined,

					Items.map((Item) =>
						Item.id === Id ? { ...Item, ...updates } : Item,
					).sort((a, b) => a.priority - b.priority),
				]);

				yield* TelemetryService.log(
					"info",

					`Updated status bar item: ${Id}`,
				);
			} catch (error) {
				return yield* Effect.fail(new StatusBarUpdateError(Id, error));
			}
		});

	// Atom: Remove a status bar item
	const RemoveItem = (
		Id: string,
	): Effect.Effect<void, StatusBarItemNotFoundError> =>
		Effect.gen(function* () {
			const Existing = yield* GetItem(Id);

			if (!Existing) {
				return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
			}

			yield* SubscriptionRef.modify(ItemsRef, (Items) => [
				undefined,

				Items.filter((Item) => Item.id !== Id),
			]);

			yield* TelemetryService.log(
				"info",

				`Removed status bar item: ${Id}`,
			);
		});

	// Atom: Get a specific status bar item
	const GetItem = (
		Id: string,
	): Effect.Effect<StatusBarItem | undefined, never> =>
		Effect.map(ItemsRef.get, (Items) =>
			Items.find((Item) => Item.id === Id),
		);

	// Atom: Get all status bar items
	const Items = ItemsRef.get;

	// Atom: Stream of items changes
	const ItemsChanges = ItemsRef.changes;

	// Atom: Set item visibility
	const SetItemVisibility = (
		Id: string,

		visible: boolean,
	): Effect.Effect<void, StatusBarItemNotFoundError> =>
		Effect.gen(function* () {
			const Existing = yield* GetItem(Id);

			if (!Existing) {
				return yield* Effect.fail(new StatusBarItemNotFoundError(Id));
			}

			// Visibility is managed via presence in the items array
			if (!visible) {
				yield* RemoveItem(Id);
			} else {
				// Item is already visible if it exists
				yield* Effect.void;
			}
		});

	// Atom: Get item text
	const GetItemText = (
		Id: string,
	): Effect.Effect<string | undefined, never> =>
		Effect.map(GetItem(Id), (Item) => Item?.text);

	// Atom: Set item text
	const SetItemText = (
		Id: string,

		text: string,
	): Effect.Effect<
		void,

		StatusBarItemNotFoundError | StatusBarUpdateError
	> => UpdateItem(Id, { text });

	Effect.runSync(TelemetryService.log("info", "StatusBar service initialized"));

	const service: StatusBarService = {
		createItem: CreateItem,
		updateItem: UpdateItem,
		removeItem: RemoveItem,
		getItem: GetItem,
		items: Items,
		itemsChanges: ItemsChanges,
		setItemVisibility: SetItemVisibility,
		getItemText: GetItemText,
		setItemText: SetItemText,
	};

	return service;
}

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
const StatusBarLive = Layer.succeed(StatusBarTag, makeStatusBarService());

export default StatusBarLive;
