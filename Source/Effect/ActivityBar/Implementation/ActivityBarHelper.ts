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
export const GenerateItemId = (): string =>
  `activitybar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Creates the createItem effect implementation.
 */
export const MakeCreateItem = (
  ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
  Telemetry: TelemetryService,
) => {
  return (Item: CreateActivityBarItem): Effect.Effect<ActivityBarItem, never> =>
    Effect.gen(function* () {
      const Id = GenerateItemId();
      const NewItem: ActivityBarItem = { ...Item, id: Id };

      yield* SubscriptionRef.modify(ItemsRef, (Items) =>
        [undefined, [...Items, NewItem].sort((a, b) => a.position - b.position)],
      );

      yield* Telemetry.log("info", `Created activity bar item: ${Id}`);
      return NewItem;
    });
};

/**
 * Creates the updateItem effect implementation.
 */
export const MakeUpdateItem = (
  ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
  GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
  Telemetry: TelemetryService,
) => {
  return (
    Id: string,
    Updates: Partial<Omit<ActivityBarItem, "id">>,
  ): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
    Effect.gen(function* () {
      const Existing = yield* GetItem(Id);

      if (!Existing) {
        return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
      }

      try {
        // Remove badge if explicitly set to undefined
        const CleanUpdatesMap = new Map<string, unknown>();
        Object.entries(Updates).forEach(([Key, Value]) => {
          if (Key !== "badge" || Value !== undefined) {
            CleanUpdatesMap.set(Key, Value);
          }
        });
        const CleanUpdates: Partial<Omit<ActivityBarItem, "id">> = Object.fromEntries(CleanUpdatesMap);

        yield* SubscriptionRef.modify(ItemsRef, (Items) =>
          [undefined, Items.map((Item) => Item.id === Id ? { ...Item, ...CleanUpdates } : Item).sort((a, b) => a.position - b.position)],
        );

        yield* Telemetry.log("info", `Updated activity bar item: ${Id}`);
      } catch (Error) {
        return yield* Effect.fail(new ActivityBarUpdateError(Id, Error));
      }
    });
};

/**
 * Creates the removeItem effect implementation.
 */
export const MakeRemoveItem = (
  ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
  ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>,
  GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
  Telemetry: TelemetryService,
) => {
  return (Id: string): Effect.Effect<void, ActivityBarItemNotFoundError> =>
    Effect.gen(function* () {
      const Existing = yield* GetItem(Id);

      if (!Existing) {
        return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
      }

      yield* SubscriptionRef.modify(ItemsRef, (Items) =>
        [undefined, Items.filter((Item) => Item.id !== Id)],
      );

      // Clear active state if this was the active item
      const CurrentActive = yield* ActiveItemRef.get;
      if (CurrentActive === Id) {
        yield* SubscriptionRef.set(ActiveItemRef, undefined);
      }

      yield* Telemetry.log("info", `Removed activity bar item: ${Id}`);
    });
};

/**
 * Creates the getItem effect implementation.
 */
export const MakeGetItem = (
  ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>,
) => {
  return (Id: string): Effect.Effect<ActivityBarItem | undefined, never> =>
    Effect.map(ItemsRef.get, (Items) => Items.find((Item) => Item.id === Id));
};

/**
 * Creates the setActiveItem effect implementation.
 */
export const MakeSetActiveItem = (
  ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>,
  GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
  Telemetry: TelemetryService,
) => {
  return (Id: string): Effect.Effect<void, ActivityBarItemNotFoundError> =>
    Effect.gen(function* () {
      const Existing = yield* GetItem(Id);

      if (!Existing) {
        return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
      }

      yield* SubscriptionRef.set(ActiveItemRef, Id);
      yield* Telemetry.log("info", `Set active activity bar item: ${Id}`);
    });
};

/**
 * Creates the setBadge effect implementation.
 */
export const MakeSetBadge = (
  UpdateItem: (
    Id: string,
    Updates: Partial<Omit<ActivityBarItem, "id">>,
  ) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>,
) => {
  return (
    Id: string,
    Badge: ActivityBarBadge | undefined,
  ): Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError> =>
    Badge === undefined
      ? UpdateItem(Id, {} as Partial<Omit<ActivityBarItem, "id">>) // badge removed by helper
      : UpdateItem(Id, { badge: Badge });
};

/**
 * Creates the getBadge effect implementation.
 */
export const MakeGetBadge = (
  GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>,
) => {
  return (Id: string): Effect.Effect<ActivityBarBadge | undefined, never> =>
    Effect.map(GetItem(Id), (Item) => Item?.badge);
};

export default {
  MakeCreateItem,
  MakeUpdateItem,
  MakeRemoveItem,
  MakeGetItem,
  MakeSetActiveItem,
  MakeSetBadge,
  MakeGetBadge,
  GenerateItemId,
};
