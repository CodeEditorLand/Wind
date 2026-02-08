/**
 * @module Effect/Panel
 * @description
 * Atomic Panel service using Effect-TS.
 * Manages bottom panel views (output, debug console, terminal, problems, etc.).
 */

import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";

import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Panel Error Types
// ============================================================================

export class PanelViewNotFoundError extends Error {
	readonly _tag = "PanelViewNotFoundError";
	constructor(viewId: string) {
		super(`Panel view '${viewId}' not found`);
		Object.setPrototypeOf(this, PanelViewNotFoundError.prototype);
	}
	override get name() { return "PanelViewNotFoundError"; }
}

export class PanelUpdateError extends Error {
	readonly _tag = "PanelUpdateError";
	constructor(viewId: string, cause: unknown) {
		super(`Failed to update panel view '${viewId}': ${String(cause)}`);
		this.cause = cause;
		Object.setPrototypeOf(this, PanelUpdateError.prototype);
	}
	override get name() { return "PanelUpdateError"; }
}

// ============================================================================
// Panel View Types
// ============================================================================

export type PanelViewType = "output" | "debug" | "terminal" | "problems" | "custom";

export interface PanelView {
	readonly id: string;
	readonly title: string;
	readonly type: PanelViewType;
	readonly priority: number;
	readonly visible: boolean;
	readonly maximized: boolean;
}

export type CreatePanelView = Omit<PanelView, "id">;

// ============================================================================
// Panel Service Interface
// ============================================================================

export interface PanelService {
	/** Create a new panel view */
	readonly createView: (
		view: CreatePanelView,
	) => Effect.Effect<PanelView, never>;

	/** Update an existing panel view */
	readonly updateView: (
		id: string,
		updates: Partial<Omit<PanelView, "id">>,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Remove a panel view */
	readonly removeView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError>;

	/** Get a specific panel view by ID */
	readonly getView: (
		id: string,
	) => Effect.Effect<PanelView | undefined, never>;

	/** Get all panel views */
	readonly views: Effect.Effect<ReadonlyArray<PanelView>, never>;

	/** Stream of panel view changes */
	readonly viewsChanges: Stream.Stream<ReadonlyArray<PanelView>, never>;

	/** Set the active panel view */
	readonly setActiveView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError>;

	/** Get the currently active panel view ID */
	readonly getActiveView: Effect.Effect<string | undefined, never>;

	/** Stream of active view changes */
	readonly activeViewChanges: Stream.Stream<string | undefined, never>;

	/** Show a panel view */
	readonly showView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Hide a panel view */
	readonly hideView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Toggle a panel view's visibility */
	readonly toggleView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Maximize a panel view */
	readonly maximizeView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Restore a panel view from maximized state */
	readonly restoreView: (
		id: string,
	) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;

	/** Get views by type */
	readonly getViewsByType: (
		type: PanelViewType,
	) => Effect.Effect<ReadonlyArray<PanelView>, never>;

	/** Get visible views */
	readonly getVisibleViews: Effect.Effect<ReadonlyArray<PanelView>, never>;

	/** Get maximized view */
	readonly getMaximizedView: Effect.Effect<PanelView | undefined, never>;
}

// Tag for dependency injection
export class PanelTag extends Context.Tag("Panel")<PanelTag, PanelService>() {}

export const Panel = PanelTag;

// ============================================================================
// Implementation
// ============================================================================

export const PanelLive = Layer.effect(
	Panel,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of panel views as reactive ref
		const viewsRef = yield* SubscriptionRef.make<ReadonlyArray<PanelView>>([]);

		// Active view state as reactive ref
		const activeViewRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new panel view
		const createView = (
			view: CreatePanelView,
		): Effect.Effect<PanelView, never> =>
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
						views.map((view) =>
							view.id === id ? { ...view, ...updates } : view,
						).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated panel view: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new PanelUpdateError(id, error));
				}
			});

		// Atom: Remove a panel view
		const removeView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					views.filter((view) => view.id !== id),
				]);

				// Clear active state if this was the active view
				const currentActive = yield* activeViewRef.get;
				if (currentActive === id) {
					yield* SubscriptionRef.set(activeViewRef, undefined);
				}

				yield* telemetry.log("info", `Removed panel view: ${id}`);
			});

		// Atom: Get a specific panel view
		const getView = (
			id: string,
		): Effect.Effect<PanelView | undefined, never> =>
			Effect.map(viewsRef.get, (views) => views.find((view) => view.id === id));

		// Atom: Get all panel views
		const views = viewsRef.get;

		// Atom: Stream of views changes
		const viewsChanges = viewsRef.changes;

		// Atom: Set active view
		const setActiveView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				// Show the view when setting it as active
				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					views.map((view) =>
						view.id === id ? { ...view, visible: true, maximized: false } : view,
					),
				]);

				yield* SubscriptionRef.set(activeViewRef, id);
				yield* telemetry.log("info", `Set active panel view: ${id}`);
			});

		// Atom: Get active view
		const getActiveView = activeViewRef.get;

		// Atom: Stream of active view changes
		const activeViewChanges = activeViewRef.changes;

		// Atom: Show view
		const showView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { visible: true });
				yield* telemetry.log("info", `Showed panel view: ${id}`);
			});

		// Atom: Hide view
		const hideView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { visible: false });
				yield* telemetry.log("info", `Hid panel view: ${id}`);
			});

		// Atom: Toggle view visibility
		const toggleView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getView(id);

				if (!existing) {
					return yield* Effect.fail(new PanelViewNotFoundError(id));
				}

				yield* updateView(id, { visible: !existing.visible });
				yield* telemetry.log("info", `Toggled panel view: ${id}`);
			});

		// Atom: Maximize view
		const maximizeView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				// Restore all other views first
				yield* SubscriptionRef.modify(viewsRef, (views) => [
					undefined,
					views.map((view) =>
						view.id === id ? { ...view, maximized: true } : { ...view, maximized: false },
					),
				]);

				yield* telemetry.log("info", `Maximized panel view: ${id}`);
			});

		// Atom: Restore view
		const restoreView = (
			id: string,
		): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
			Effect.gen(function* () {
				yield* updateView(id, { maximized: false });
				yield* telemetry.log("info", `Restored panel view: ${id}`);
			});

		// Atom: Get views by type
		const getViewsByType = (
			type: PanelViewType,
		): Effect.Effect<ReadonlyArray<PanelView>, never> =>
			Effect.map(views, (views) => views.filter((view) => view.type === type));

		// Atom: Get visible views
		const getVisibleViews: Effect.Effect<ReadonlyArray<PanelView>, never> =
			Effect.map(views, (views) => views.filter((view) => view.visible));

		// Atom: Get maximized view
		const getMaximizedView: Effect.Effect<PanelView | undefined, never> =
			Effect.map(views, (views) => views.find((view) => view.maximized));

		yield* telemetry.log("info", "Panel service initialized");

		return {
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
	}),
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

export const PanelMockLive = Layer.succeed(Panel, {
	createView: (view: CreatePanelView) =>
		Effect.succeed({
			...view,
			id: `mock-panel-${Date.now()}`,
		}),
	updateView: (_id: string, _updates: Partial<Omit<PanelView, "id">>) =>
		Effect.void,
	removeView: (_id: string) => Effect.void,
	getView: (_id: string) => Effect.succeed(undefined),
	views: Effect.succeed([]),
	viewsChanges: Stream.empty,
	setActiveView: (_id: string) => Effect.void,
	getActiveView: Effect.succeed(undefined),
	activeViewChanges: Stream.empty,
	showView: (_id: string) => Effect.void,
	hideView: (_id: string) => Effect.void,
	toggleView: (_id: string) => Effect.void,
	maximizeView: (_id: string) => Effect.void,
	restoreView: (_id: string) => Effect.void,
	getViewsByType: (_type: PanelViewType) => Effect.succeed([]),
	getVisibleViews: Effect.succeed([]),
	getMaximizedView: Effect.succeed(undefined),
});
