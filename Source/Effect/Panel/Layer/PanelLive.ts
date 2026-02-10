/**
 * @module Effect/Panel/Layer/PanelLive
 * @description
 * Live layer for Panel service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Layer/PanelMock} Mock layer
 * @category Layer
 */

import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import PanelTag from "../Tag/PanelTag.js";
import type { PanelService } from "../Interface/PanelService.js";
import type { PanelView, CreatePanelView, PanelViewType } from "../Type/PanelType.js";
import PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import PanelUpdateError from "../Error/PanelUpdateError.js";
import { Telemetry } from "../../Telemetry.js";

/**
 * Live layer for Panel service.
 * Provides reactive panel management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { PanelLive } from "./Effect/Panel/Layer/PanelLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, PanelLive);
 * ```
 */
const PanelLive = Layer.effect(
	PanelTag,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of panel views as reactive ref
		const viewsRef = yield* SubscriptionRef.make<ReadonlyArray<PanelView>>([]);

		// Active view state as reactive ref
		const activeViewRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new panel view
		const createView = (view: CreatePanelView): Effect.Effect<PanelView, never> =>
			Effect.gen(function* () {
				const id = `panel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newView: PanelView = { ...view, id };

				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					[...views, newView].sort((a, b) => a.priority - b.priority),
				]);

				yield* telemetry.log("info", `Created panel view: ${id}`);
				return newView;
			});

		// Atom: Update an existing panel view
		const updateView = (
			id: string,
			updates: Partial<Omit<PanelView, "id">>,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				try {
					yield* SubscriptionRef.modify(viewsRef, (views) => [
						undefined,
						views.map((view) => (view.id === id ? { ...view, ...updates } : view)).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated panel view: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new PanelUpdateError(id, error));
				}
			});

		// Atom: Remove a panel view
		const removeView = (id: string): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				yield* SubscriptionRef.modify(viewsRef, (views) => [undefined, views.filter((view) => view.id !== id)]);

				// Clear active state if this was the active view
				const currentActive = yield* activeViewRef.get;
				if (currentActive === id) {
					yield* SubscriptionRef.set(activeViewRef, undefined);
				}

				yield* telemetry.log("info", `Removed panel view: ${id}`);
			});

		// Atom: Get a specific panel view
		const getView = (id: string): Effect.Effect<PanelView | undefined, never> =>
			Effect.map(viewsRef.get, (views) => views.find((view) => view.id === id));

		// Atom: Get all panel views
		const views = viewsRef.get;

		// Atom: Stream of views changes
		const viewsChanges = viewsRef.changes;

		// Atom: Set active view
		const setActiveView = (id: string): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				// Show the view when setting it as active
				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					views.map((view) => (view.id === id ? { ...view, visible: true, maximized: false } : view)),
				]);

				yield* SubscriptionRef.set(activeViewRef, id);
				yield* telemetry.log("info", `Set active panel view: ${id}`);
			});

		// Atom: Get active view
		const getActiveView = activeViewRef.get;

		// Atom: Stream of active view changes
		const activeViewChanges = activeViewRef.changes;

		// Atom: Show view
		const showView = (id: string): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { visible: true });
				yield* telemetry.log("info", `Showed panel view: ${id}`);
			});

		// Atom: Hide view
		const hideView = (id: string): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { visible: false });
				yield* telemetry.log("info", `Hid panel view: ${id}`);
			});

		// Atom: Toggle view visibility
		const toggleView = (id: string): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				yield* updateView(id, { visible: !existing.visible });
				yield* telemetry.log("info", `Toggled panel view: ${id}`);
			});

		// Atom: Maximize view
		const maximizeView = (id: string): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				// Restore all other views first
				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					views.map((view) => (view.id === id ? { ...view, maximized: true } : { ...view, maximized: false })),
				]);

				yield* telemetry.log("info", `Maximized panel view: ${id}`);
			});

		// Atom: Restore view
		const restoreView = (id: string): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { maximized: false });
				yield* telemetry.log("info", `Restored panel view: ${id}`);
			});

		// Atom: Get views by type
		const getViewsByType = (type: PanelViewType): Effect.Effect<ReadonlyArray<PanelView>, never> =>
			Effect.map(views, (views) => views.filter((view) => view.type === type));

		// Atom: Get visible views
		const getVisibleViews: Effect.Effect<ReadonlyArray<PanelView>, never> = Effect.map(views, (views) => views.filter((view) => view.visible));

		// Atom: Get maximized view
		const getMaximizedView: Effect.Effect<PanelView | undefined, never> = Effect.map(views, (views) => views.find((view) => view.maximized));

		yield* telemetry.log("info", "Panel service initialized");

		const service: PanelService = {
			createView,
			updateView,
			removeView,
			getView,
			views,
			viewsChanges,
			setActiveView,
			getActiveView,
			activeViewChanges,
			showView,
			hideView,
			toggleView,
			maximizeView,
			restoreView,
			getViewsByType,
			getVisibleViews,
			getMaximizedView,
		};

		return service;
	}),
);

export default PanelLive;
