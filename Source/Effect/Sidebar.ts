/**
 * @module Effect/Sidebar
 * @description
 * Atomic Sidebar service using Effect-TS.
 * Manages sidebar panels, their display, and active/collapsed states.
 */

import { Context, Effect, Layer, Stream, SubscriptionRef } from "effect";

import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Sidebar Error Types
// ============================================================================

export class SidebarPanelNotFoundError extends Error {
	readonly _tag = "SidebarPanelNotFoundError";
	constructor(panelId: string) {
		super(`Sidebar panel '${panelId}' not found`);
		Object.setPrototypeOf(this, SidebarPanelNotFoundError.prototype);
	}
	override get name() { return "SidebarPanelNotFoundError"; }
}

export class SidebarUpdateError extends Error {
	readonly _tag = "SidebarUpdateError";
	constructor(panelId: string, cause: unknown) {
		super(`Failed to update sidebar panel '${panelId}': ${String(cause)}`);
		this.cause = cause;
		Object.setPrototypeOf(this, SidebarUpdateError.prototype);
	}
	override get name() { return "SidebarUpdateError"; }
}

// ============================================================================
// Sidebar Panel Types
// ============================================================================

export interface SidebarPanel {
	readonly id: string;
	readonly title: string;
	readonly icon: string;
	readonly position: "left" | "right";
	readonly priority: number;
	readonly viewId: string;
	readonly collapsed: boolean;
}

export type CreateSidebarPanel = Omit<SidebarPanel, "id">;

// ============================================================================
// Sidebar Service Interface
// ============================================================================

export interface SidebarService {
	/** Create a new sidebar panel */
	readonly createPanel: (
		panel: CreateSidebarPanel,
	) => Effect.Effect<SidebarPanel, never>;

	/** Update an existing sidebar panel */
	readonly updatePanel: (
		id: string,
		updates: Partial<Omit<SidebarPanel, "id">>,
	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

	/** Remove a sidebar panel */
	readonly removePanel: (
		id: string,
	) => Effect.Effect<void, SidebarPanelNotFoundError>;

	/** Get a specific sidebar panel by ID */
	readonly getPanel: (
		id: string,
	) => Effect.Effect<SidebarPanel | undefined, never>;

	/** Get all sidebar panels */
	readonly panels: Effect.Effect<ReadonlyArray<SidebarPanel>, never>;

	/** Stream of sidebar panel changes */
	readonly panelsChanges: Stream.Stream<ReadonlyArray<SidebarPanel>, never>;

	/** Set the active sidebar panel */
	readonly setActivePanel: (
		id: string,
	) => Effect.Effect<void, SidebarPanelNotFoundError>;

	/** Get the currently active sidebar panel ID */
	readonly getActivePanel: Effect.Effect<string | undefined, never>;

	/** Stream of active panel changes */
	readonly activePanelChanges: Stream.Stream<string | undefined, never>;

	/** Toggle a sidebar panel's collapsed state */
	readonly togglePanel: (
		id: string,
	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

	/** Collapse a sidebar panel */
	readonly collapsePanel: (
		id: string,
	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

	/** Expand a sidebar panel */
	readonly expandPanel: (
		id: string,
	) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;

	/** Get panels by position (left/right) */
	readonly getPanelsByPosition: (
		position: "left" | "right",
	) => Effect.Effect<ReadonlyArray<SidebarPanel>, never>;
}

// Tag for dependency injection
export class SidebarTag extends Context.Tag("Sidebar")<SidebarTag, SidebarService>() {}

export const Sidebar = SidebarTag;

// ============================================================================
// Implementation
// ============================================================================

export const SidebarLive = Layer.effect(
	Sidebar,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of sidebar panels as reactive ref
		const panelsRef = yield* SubscriptionRef.make<ReadonlyArray<SidebarPanel>>([]);

		// Active panel state as reactive ref
		const activePanelRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new sidebar panel
		const createPanel = (
			panel: CreateSidebarPanel,
		): Effect.Effect<SidebarPanel, never> =>
			Effect.gen(function* () {
				const id = `sidebar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newPanel: SidebarPanel = { ...panel, id };

				yield* SubscriptionRef.modify(panelsRef, (panels) => [
					undefined,
					[...panels, newPanel].sort((a, b) => a.priority - b.priority),
				]);

				yield* telemetry.log("info", `Created sidebar panel: ${id}`);
				return newPanel;
			});

		// Atom: Update an existing sidebar panel
		const updatePanel = (
			id: string,
			updates: Partial<Omit<SidebarPanel, "id">>,
		): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				try {
					yield* SubscriptionRef.modify(panelsRef, (panels) => [
						undefined,
						panels.map((panel) =>
							panel.id === id ? { ...panel, ...updates } : panel,
						).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated sidebar panel: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new SidebarUpdateError(id, error));
				}
			});

		// Atom: Remove a sidebar panel
		const removePanel = (
			id: string,
		): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				yield* SubscriptionRef.modify(panelsRef, (panels) => [
					undefined,
					panels.filter((panel) => panel.id !== id),
				]);

				// Clear active state if this was the active panel
				const currentActive = yield* activePanelRef.get;
				if (currentActive === id) {
					yield* SubscriptionRef.set(activePanelRef, undefined);
				}

				yield* telemetry.log("info", `Removed sidebar panel: ${id}`);
			});

		// Atom: Get a specific sidebar panel
		const getPanel = (
			id: string,
		): Effect.Effect<SidebarPanel | undefined, never> =>
			Effect.map(panelsRef.get, (panels) => panels.find((panel) => panel.id === id));

		// Atom: Get all sidebar panels
		const panels = panelsRef.get;

		// Atom: Stream of panels changes
		const panelsChanges = panelsRef.changes;

		// Atom: Set active panel
		const setActivePanel = (
			id: string,
		): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				// Expand the panel when setting it as active
				yield* SubscriptionRef.modify(panelsRef, (panels) => [
					undefined,
					panels.map((panel) =>
						panel.id === id ? { ...panel, collapsed: false } : panel,
					),
				]);

				yield* SubscriptionRef.set(activePanelRef, id);
				yield* telemetry.log("info", `Set active sidebar panel: ${id}`);
			});

		// Atom: Get active panel
		const getActivePanel = activePanelRef.get;

		// Atom: Stream of active panel changes
		const activePanelChanges = activePanelRef.changes;

		// Atom: Toggle panel
		const togglePanel = (
			id: string,
		): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				yield* updatePanel(id, { collapsed: !existing.collapsed });
				yield* telemetry.log("info", `Toggled sidebar panel: ${id}`);
			});

		// Atom: Collapse panel
		const collapsePanel = (
			id: string,
		): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* updatePanel(id, { collapsed: true });
				yield* telemetry.log("info", `Collapsed sidebar panel: ${id}`);
			});

		// Atom: Expand panel
		const expandPanel = (
			id: string,
		): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* updatePanel(id, { collapsed: false });
				yield* telemetry.log("info", `Expanded sidebar panel: ${id}`);
			});

		// Atom: Get panels by position
		const getPanelsByPosition = (
			position: "left" | "right",
		): Effect.Effect<ReadonlyArray<SidebarPanel>, never> =>
			Effect.map(panels, (panels) =>
				panels.filter((panel) => panel.position === position),
			);

		yield* telemetry.log("info", "Sidebar service initialized");

		return {
			createPanel,
			updatePanel,
			removePanel,
			getPanel,
			panels,
			panelsChanges,
			setActivePanel,
			getActivePanel,
			activePanelChanges,
			togglePanel,
			collapsePanel,
			expandPanel,
			getPanelsByPosition,
		};
	}),
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

export const SidebarMockLive = Layer.succeed(Sidebar, {
	createPanel: (panel: CreateSidebarPanel) =>
		Effect.succeed({
			...panel,
			id: `mock-sidebar-${Date.now()}`,
		}),
	updatePanel: (_id: string, _updates: Partial<Omit<SidebarPanel, "id">>) =>
		Effect.void,
	removePanel: (_id: string) => Effect.void,
	getPanel: (_id: string) => Effect.succeed(undefined),
	panels: Effect.succeed([]),
	panelsChanges: Stream.empty,
	setActivePanel: (_id: string) => Effect.void,
	getActivePanel: Effect.succeed(undefined),
	activePanelChanges: Stream.empty,
	togglePanel: (_id: string) => Effect.void,
	collapsePanel: (_id: string) => Effect.void,
	expandPanel: (_id: string) => Effect.void,
	getPanelsByPosition: (_position: "left" | "right") => Effect.succeed([]),
});
