/**
 * @module Effect/StatusBar/Layer/StatusBarMock
 * @description
 * Mock layer for StatusBar service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live layer
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { StatusBarService } from "../Interface/StatusBarService.js";

import StatusBarTag from "../Tag/StatusBarTag.js";

import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

/**
 * Creates a mock StatusBar service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock StatusBar service instance
 */
const makeMockStatusBar = (): StatusBarService => ({
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

/**
 * Mock layer for StatusBar service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { StatusBarMockLive } from "./Effect/StatusBar/Layer/StatusBarMock.js";
 *
 * const testLayer = StatusBarMockLive;
 * ```
 */
const StatusBarMockLive = Layer.succeed(StatusBarTag, makeMockStatusBar());

export default StatusBarMockLive;

export { makeMockStatusBar };
