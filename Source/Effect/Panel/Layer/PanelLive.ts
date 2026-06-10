/**
 * @module Effect/Panel/Layer/PanelLive
 * @description
 * Live layer for Panel service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Layer/PanelMock} Mock layer
 * @category Layer
 */

import { Effect, Layer, SubscriptionRef } from "effect";

import { Telemetry, TelemetryLive } from "../../Telemetry.js";
import PanelUpdateError from "../Error/PanelUpdateError.js";
import PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import type { PanelService } from "../Interface/PanelService.js";
import PanelTag from "../Tag/PanelTag.js";
import type {
	CreatePanelView,
	PanelView,
	PanelViewType,
} from "../Type/PanelType.js";

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
		const TelemetryService = Effect.runSync(
			Effect.provide(Telemetry, TelemetryLive),
		);

		// In-memory storage of panel views as reactive ref
		const ViewsRef = yield* SubscriptionRef.make<ReadonlyArray<PanelView>>(
			[],
		);

		// Active view state as reactive ref
		const ActiveViewRef = yield* SubscriptionRef.make<string | undefined>(
			undefined,
		);

		// Atom: Create a new panel view
		const CreateView = (
			View: CreatePanelView,
		): Effect.Effect<PanelView, never> =>
			Effect.gen(function* () {
				const Id = `panel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

				const NewView: PanelView = { ...View, id: Id };

				yield* SubscriptionRef.modify(ViewsRef, (Views) => [
					undefined,

					[...Views, NewView].sort((a, b) => a.priority - b.priority),
				]);

				yield* TelemetryService.log(
					"info",

					`Created panel view: ${Id}`,
				);

				return NewView;
			});

		// Atom: Update an existing panel view
		const UpdateView = (
			Id: string,

			updates: Partial<Omit<PanelView, "id">>,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				const Existing = yield* GetView(Id);

				if (!Existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(Id));
				}

				try {
					yield* SubscriptionRef.modify(ViewsRef, (Views) => [
						undefined,

						Views.map((View) =>
							View.id === Id ? { ...View, ...updates } : View,
						).sort((a, b) => a.priority - b.priority),
					]);

					yield* TelemetryService.log(
						"info",

						`Updated panel view: ${Id}`,
					);
				} catch (error) {
					return yield* Effect.fail(new PanelUpdateError(Id, error));
				}
			});

		// Atom: Remove a panel view
		const RemoveView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const Existing = yield* GetView(Id);

				if (!Existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(Id));
				}

				yield* SubscriptionRef.modify(ViewsRef, (Views) => [
					undefined,

					Views.filter((View) => View.id !== Id),
				]);

				// Clear active state if this was the active view
				const CurrentActive = yield* ActiveViewRef.get;

				if (CurrentActive === Id) {
					yield* SubscriptionRef.set(ActiveViewRef, undefined);
				}

				yield* TelemetryService.log(
					"info",

					`Removed panel view: ${Id}`,
				);
			});

		// Atom: Get a specific panel view
		const GetView = (
			Id: string,
		): Effect.Effect<PanelView | undefined, never> =>
			Effect.map(ViewsRef.get, (Views) =>
				Views.find((View) => View.id === Id),
			);

		// Atom: Get all panel views
		const Views = ViewsRef.get;

		// Atom: Stream of views changes
		const ViewsChanges = ViewsRef.changes;

		// Atom: Set active view
		const SetActiveView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const Existing = yield* GetView(Id);

				if (!Existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(Id));
				}

				// Show the view when setting it as active
				yield* SubscriptionRef.modify(ViewsRef, (Views) => [
					undefined,

					Views.map((View) =>
						View.id === Id
							? { ...View, visible: true, maximized: false }
							: View,
					),
				]);

				yield* SubscriptionRef.set(ActiveViewRef, Id);

				yield* TelemetryService.log(
					"info",

					`Set active panel view: ${Id}`,
				);
			});

		// Atom: Get active view
		const GetActiveView = ActiveViewRef.get;

		// Atom: Stream of active view changes
		const ActiveViewChanges = ActiveViewRef.changes;

		// Atom: Show view
		const ShowView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* UpdateView(Id, { visible: true });

				yield* TelemetryService.log("info", `Showed panel view: ${Id}`);
			});

		// Atom: Hide view
		const HideView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* UpdateView(Id, { visible: false });

				yield* TelemetryService.log("info", `Hid panel view: ${Id}`);
			});

		// Atom: Toggle view visibility
		const ToggleView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				const Existing = yield* GetView(Id);

				if (!Existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(Id));
				}

				yield* UpdateView(Id, { visible: !Existing.visible });

				yield* TelemetryService.log(
					"info",

					`Toggled panel view: ${Id}`,
				);
			});

		// Atom: Maximize view
		const MaximizeView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				// Restore all other views first
				yield* SubscriptionRef.modify(ViewsRef, (Views) => [
					undefined,

					Views.map((View) =>
						View.id === Id
							? { ...View, maximized: true }
							: { ...View, maximized: false },
					),
				]);

				yield* TelemetryService.log(
					"info",

					`Maximized panel view: ${Id}`,
				);
			});

		// Atom: Restore view
		const RestoreView = (
			Id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* UpdateView(Id, { maximized: false });

				yield* TelemetryService.log(
					"info",

					`Restored panel view: ${Id}`,
				);
			});

		// Atom: Get views by type
		const GetViewsByType = (
			Type: PanelViewType,
		): Effect.Effect<ReadonlyArray<PanelView>, never> =>
			Effect.map(Views, (Views) =>
				Views.filter((View) => View.type === Type),
			);

		// Atom: Get visible views
		const GetVisibleViews: Effect.Effect<
			ReadonlyArray<PanelView>,
			never
		> = Effect.map(Views, (Views) => Views.filter((View) => View.visible));

		// Atom: Get maximized view
		const GetMaximizedView: Effect.Effect<PanelView | undefined, never> =
			Effect.map(Views, (Views) => Views.find((View) => View.maximized));

		yield* TelemetryService.log("info", "Panel service initialized");

		const service: PanelService = {
			createView: CreateView,
			updateView: UpdateView,
			removeView: RemoveView,
			getView: GetView,
			views: Views,
			viewsChanges: ViewsChanges,
			setActiveView: SetActiveView,
			getActiveView: GetActiveView,
			activeViewChanges: ActiveViewChanges,
			showView: ShowView,
			hideView: HideView,
			toggleView: ToggleView,
			maximizeView: MaximizeView,
			restoreView: RestoreView,
			getViewsByType: GetViewsByType,
			getVisibleViews: GetVisibleViews,
			getMaximizedView: GetMaximizedView,
		};

		return service;
	}),
);

export default PanelLive;
