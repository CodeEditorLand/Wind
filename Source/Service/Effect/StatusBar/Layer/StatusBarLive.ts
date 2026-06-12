/**
 * @module Effect/StatusBar/Layer/StatusBarLive
 * @description
 * Live layer for StatusBar service - plain mutable state, no Effect-TS runtime overhead.
 * @category Layer
 */

import StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";
import StatusBarUpdateError from "../Error/StatusBarUpdateError.js";
import type { StatusBarService } from "../Interface/StatusBarService.js";
import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

function makeStatusBarService(): StatusBarService {
	let _items: ReadonlyArray<StatusBarItem> = [];

	const _itemsListeners: ((v: ReadonlyArray<StatusBarItem>) => void)[] = [];

	const GetItem = (Id: string): StatusBarItem | undefined =>
		_items.find((i) => i.id === Id);

	const Items: ReadonlyArray<StatusBarItem> = _items;

	const OnItemsChanges = (
		listener: (items: ReadonlyArray<StatusBarItem>) => void,
	): (() => void) => {
		_itemsListeners.push(listener);

		return () => {
			const i = _itemsListeners.indexOf(listener);

			if (i >= 0) _itemsListeners.splice(i, 1);
		};
	};

	const CreateItem = (Item: CreateStatusBarItem): StatusBarItem => {
		const Id = `statusbar-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;

		const NewItem: StatusBarItem = { ...Item, id: Id };

		_items = [..._items, NewItem].sort((a, b) => a.priority - b.priority);

		_itemsListeners.forEach((fn) => fn(_items));

		return NewItem;
	};

	const UpdateItem = (
		Id: string,

		updates: Partial<Omit<StatusBarItem, "id">>,
	): void => {
		if (!_items.find((i) => i.id === Id))
			throw new StatusBarItemNotFoundError(Id);

		try {
			_items = _items
				.map((i) => (i.id === Id ? { ...i, ...updates } : i))
				.sort((a, b) => a.priority - b.priority);

			_itemsListeners.forEach((fn) => fn(_items));
		} catch (error) {
			throw new StatusBarUpdateError(Id, error);
		}
	};

	const RemoveItem = (Id: string): void => {
		if (!_items.find((i) => i.id === Id))
			throw new StatusBarItemNotFoundError(Id);

		_items = _items.filter((i) => i.id !== Id);

		_itemsListeners.forEach((fn) => fn(_items));
	};

	const SetItemVisibility = (
		Id: string,

		visible: boolean,
	): void => {
		if (!_items.find((i) => i.id === Id))
			throw new StatusBarItemNotFoundError(Id);

		if (!visible) {
			RemoveItem(Id);

			return;
		}
	};

	const GetItemText = (Id: string): string | undefined =>
		_items.find((i) => i.id === Id)?.text;

	const SetItemText = (
		Id: string,

		text: string,
	): void => UpdateItem(Id, { text });

	return {
		createItem: CreateItem,

		updateItem: UpdateItem,

		removeItem: RemoveItem,

		getItem: GetItem,

		items: Items,

		onItemsChanges: OnItemsChanges,

		setItemVisibility: SetItemVisibility,

		getItemText: GetItemText,

		setItemText: SetItemText,
	} satisfies StatusBarService;
}

export const LiveStatusBarService = makeStatusBarService();

export default LiveStatusBarService;
