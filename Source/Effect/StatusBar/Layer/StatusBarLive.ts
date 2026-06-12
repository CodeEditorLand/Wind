/**
 * @module Effect/StatusBar/Layer/StatusBarLive
 * @description
 * Live layer for StatusBar service - plain mutable state, no Effect-TS runtime overhead.
 * @category Layer
 */

import { Effect, Either, Layer, Stream } from "effect";

import StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";

import StatusBarUpdateError from "../Error/StatusBarUpdateError.js";

import type { StatusBarService } from "../Interface/StatusBarService.js";

import StatusBarTag from "../Tag/StatusBarTag.js";

import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

function makeStatusBarService(): StatusBarService {

	let _items: ReadonlyArray<StatusBarItem> = [];

	const _itemsListeners: ((v: ReadonlyArray<StatusBarItem>) => void)[] = [];

	const GetItem = (Id: string): Effect.Effect<StatusBarItem | undefined> =>
		Effect.succeed(_items.find((i) => i.id === Id));

	const Items = Effect.suspend(() => Effect.succeed(_items));

	const ItemsChanges: Stream.Stream<ReadonlyArray<StatusBarItem>> =
		Stream.asyncInterrupt<ReadonlyArray<StatusBarItem>>((emit) => {
			const fn = (v: ReadonlyArray<StatusBarItem>) => emit.single(v);

			_itemsListeners.push(fn);

			return Either.left(
				Effect.sync(() => {
					const i = _itemsListeners.indexOf(fn);

					if (i >= 0) _itemsListeners.splice(i, 1);
				}),
			);
		});

	const CreateItem = (
		Item: CreateStatusBarItem,
	): Effect.Effect<StatusBarItem> =>
		Effect.sync(() => {
			const Id = `statusbar-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 9)}`;

			const NewItem: StatusBarItem = { ...Item, id: Id };

			_items = [..._items, NewItem].sort(
				(a, b) => a.priority - b.priority,
			);

			_itemsListeners.forEach((fn) => fn(_items));

			return NewItem;
		});

	const UpdateItem = (
		Id: string,

		updates: Partial<Omit<StatusBarItem, "id">>,
	): Effect.Effect<
		void,

		StatusBarItemNotFoundError | StatusBarUpdateError
	> => {
		if (!_items.find((i) => i.id === Id))

			return Effect.fail(new StatusBarItemNotFoundError(Id));

		try {
			_items = _items
				.map((i) => (i.id === Id ? { ...i, ...updates } : i))
				.sort((a, b) => a.priority - b.priority);

			_itemsListeners.forEach((fn) => fn(_items));

			return Effect.void;
		} catch (error) {
			return Effect.fail(new StatusBarUpdateError(Id, error));
		}
	};

	const RemoveItem = (
		Id: string,
	): Effect.Effect<void, StatusBarItemNotFoundError> => {
		if (!_items.find((i) => i.id === Id))

			return Effect.fail(new StatusBarItemNotFoundError(Id));

		_items = _items.filter((i) => i.id !== Id);

		_itemsListeners.forEach((fn) => fn(_items));

		return Effect.void;
	};

	const SetItemVisibility = (
		Id: string,

		visible: boolean,
	): Effect.Effect<void, StatusBarItemNotFoundError> => {
		if (!_items.find((i) => i.id === Id))

			return Effect.fail(new StatusBarItemNotFoundError(Id));

		if (!visible) return RemoveItem(Id);

		return Effect.void;
	};

	const GetItemText = (Id: string): Effect.Effect<string | undefined> =>
		Effect.succeed(_items.find((i) => i.id === Id)?.text);

	const SetItemText = (
		Id: string,

		text: string,
	): Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError> =>
		UpdateItem(Id, { text });

	return {
		createItem: CreateItem,

		updateItem: UpdateItem,

		removeItem: RemoveItem,

		getItem: GetItem,

		items: Items,

		itemsChanges: ItemsChanges,

		setItemVisibility: SetItemVisibility,

		getItemText: GetItemText,

		setItemText: SetItemText,
	} satisfies StatusBarService;
}

const StatusBarLive = Layer.succeed(StatusBarTag, makeStatusBarService());

export default StatusBarLive;
