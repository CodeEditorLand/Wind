/**
 * @module Effect/ActivityBar/Implementation/ActivityBarImplementation
 * @description
 * Main implementation of ActivityBar service backed by a plain in-memory
 * store. The former reactive change streams had zero consumers and were
 * removed; Sky reads activity state through WorkbenchActivityLive instead.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @category Implementation
 */

import { ActivityBarItemNotFoundError } from "../Error/ActivityBarItemNotFoundError.js";
import { ActivityBarUpdateError } from "../Error/ActivityBarUpdateError.js";
import type {
	ActivityBarItemUpdate,
	ActivityBarService,
} from "../Interface/ActivityBarService.js";
import type {
	ActivityBarBadge,
	ActivityBarItem,
	CreateActivityBarItem,
} from "../Type/ActivityBarType.js";
import { GenerateItemId } from "./ActivityBarHelper.js";

// ============================================================================
// Live Implementation
// ============================================================================

type ActivityBarLogger = (
	level: "info" | "warn" | "error",

	message: string,
) => void;

// Mirrors the observable side effect of the Telemetry service's log method
// without pulling in its Effect-typed surface.
const DefaultLogger: ActivityBarLogger = (Level, Message) => {
	if (typeof performance !== "undefined") {
		try {
			performance.mark(`land:telemetry:${Level}:${Message.slice(0, 80)}`);
		} catch {}
	}
};

/**
 * Creates the ActivityBar service with a plain in-memory store.
 */
export const makeActivityBar = (
	Log: ActivityBarLogger = DefaultLogger,
): ActivityBarService => {
	let _items: ActivityBarItem[] = [];

	let _activeItem: string | undefined;

	const getItem = (Id: string): ActivityBarItem | undefined =>
		_items.find((Item) => Item.id === Id);

	const createItem = (Item: CreateActivityBarItem): ActivityBarItem => {
		const Id = GenerateItemId();

		const NewItem: ActivityBarItem = { ...Item, id: Id };

		_items = [..._items, NewItem].sort((a, b) => a.position - b.position);

		Log("info", `Created activity bar item: ${Id}`);

		return NewItem;
	};

	const updateItem = (Id: string, Updates: ActivityBarItemUpdate): void => {
		const Existing = getItem(Id);

		if (!Existing) {
			throw new ActivityBarItemNotFoundError(Id);
		}

		try {
			const RemoveBadge =
				"badge" in Updates && Updates.badge === undefined;

			const CleanUpdatesMap = new Map<string, unknown>();

			Object.entries(Updates).forEach(([Key, Value]) => {
				if (Key !== "badge" || Value !== undefined) {
					CleanUpdatesMap.set(Key, Value);
				}
			});

			const CleanUpdates: Partial<Omit<ActivityBarItem, "id">> =
				Object.fromEntries(CleanUpdatesMap);

			_items = _items
				.map((Item) => {
					if (Item.id !== Id) {
						return Item;
					}

					const { badge: _ExistingBadge, ...WithoutBadge } = Item;

					return RemoveBadge
						? ({
								...WithoutBadge,
								...CleanUpdates,
							} as ActivityBarItem)
						: { ...Item, ...CleanUpdates };
				})
				.sort((a, b) => a.position - b.position);

			Log("info", `Updated activity bar item: ${Id}`);
		} catch (Cause) {
			throw new ActivityBarUpdateError(Id, Cause);
		}
	};

	const removeItem = (Id: string): void => {
		const Existing = getItem(Id);

		if (!Existing) {
			throw new ActivityBarItemNotFoundError(Id);
		}

		_items = _items.filter((Item) => Item.id !== Id);

		if (_activeItem === Id) {
			_activeItem = undefined;
		}

		Log("info", `Removed activity bar item: ${Id}`);
	};

	const setActiveItem = (Id: string): void => {
		const Existing = getItem(Id);

		if (!Existing) {
			throw new ActivityBarItemNotFoundError(Id);
		}

		_activeItem = Id;

		Log("info", `Set active activity bar item: ${Id}`);
	};

	const setBadge = (
		Id: string,

		Badge: ActivityBarBadge | undefined,
	): void => {
		updateItem(Id, { badge: Badge });
	};

	Log("info", "ActivityBar service initialized");

	return {
		createItem,
		updateItem,
		removeItem,
		getItem,
		items: () => _items,
		setActiveItem,
		getActiveItem: () => _activeItem,
		setBadge,
		getBadge: (Id: string) => getItem(Id)?.badge,
		clearBadge: (Id: string) => setBadge(Id, undefined),
	} satisfies ActivityBarService;
};

/**
 * Live ActivityBar service with an in-memory store.
 */
export const ActivityBarLive: ActivityBarService = makeActivityBar();

export default ActivityBarLive;
