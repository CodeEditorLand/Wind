/**
 * @module Effect/Sidebar/Layer/SidebarLive
 * @description
 * Live layer for Sidebar service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @see {@link Effect/Sidebar/Layer/SidebarMock} Mock layer
 * @category Layer
 */

import { Effect, Layer, Stream, SubscriptionRef } from "effect";
import SidebarTag from "../Tag/SidebarTag.js";
import type { SidebarService } from "../Interface/SidebarService.js";
import type { SidebarPanel, CreateSidebarPanel } from "../Type/SidebarType.js";
import SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";
import SidebarUpdateError from "../Error/SidebarUpdateError.js";
import { Telemetry } from "../../Telemetry.js";

/**
 * Live layer for Sidebar service.
 * Provides reactive sidebar panel management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SidebarLive } from "./Effect/Sidebar/Layer/SidebarLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, SidebarLive);
 * ```
 */
const SidebarLive = Layer.effect(
	SidebarTag,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// In-memory storage of sidebar panels as reactive ref
		const panelsRef = yield* SubscriptionRef.make<ReadonlyArray<SidebarPanel>>([]);

		// Active panel state as reactive ref
		const activePanelRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new sidebar panel
		const createPanel = (panel: CreateSidebarPanel): Effect.Effect<SidebarPanel, never> =>
			Effect.gen(function* () {
				const id = `sidebar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const newPanel: SidebarPanel = { ...panel, id };

				yield* SubscriptionRef.modify(panelsRef, (panels) => [undefined, [...panels, newPanel].sort((a, b) => a.priority - b.priority)]);

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
						panels.map((panel) => (panel.id === id ? { ...panel, ...updates } : panel)).sort((a, b) => a.priority - b.priority),
					]);

					yield* telemetry.log("info", `Updated sidebar panel: ${id}`);
				} catch (error) {
					return yield* Effect.fail(new SidebarUpdateError(id, error));
				}
			});

		// Atom: Remove a sidebar panel
		const removePanel = (id: string): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				yield* SubscriptionRef.modify(panelsRef, (panels) => [undefined, panels.filter((panel) => panel.id !== id)]);

				// Clear active state if this was the active panel
				const currentActive = yield* activePanelRef.get;
				if (currentActive === id) {
					yield* SubscriptionRef.set(activePanelRef, undefined);
				}

				yield* telemetry.log("info", `Removed sidebar panel: ${id}`);
			});

		// Atom: Get a specific sidebar panel
		const getPanel = (id: string): Effect.Effect<SidebarPanel | undefined, never> =>
			Effect.map(panelsRef.get, (panels) => panels.find((panel) => panel.id === id));

		// Atom: Get all sidebar panels
		const panels = panelsRef.get;

		// Atom: Stream of panels changes
		const panelsChanges = panelsRef.changes;

		// Atom: Set active panel
		const setActivePanel = (id: string): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				// Expand the panel when setting it as active
				yield* SubscriptionRef.modify(panelsRef, (panels) => [undefined, panels.map((panel) => (panel.id === id ? { ...panel, collapsed: false } : panel))]);

				yield* SubscriptionRef.set(activePanelRef, id);
				yield* telemetry.log("info", `Set active sidebar panel: ${id}`);
			});

		// Atom: Get active panel
		const getActivePanel = activePanelRef.get;

		// Atom: Stream of active panel changes
		const activePanelChanges = activePanelRef.changes;

		// Atom: Toggle panel
		const togglePanel = (id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				const existing = yield* getPanel(id);

				if (!existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(id));
				}

				yield* updatePanel(id, { collapsed: !existing.collapsed });
				yield* telemetry.log("info", `Toggled sidebar panel: ${id}`);
			});

		// Atom: Collapse panel
		const collapsePanel = (id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* updatePanel(id, { collapsed: true });
				yield* telemetry.log("info", `Collapsed sidebar panel: ${id}`);
			});

		// Atom: Expand panel
		const expandPanel = (id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* updatePanel(id, { collapsed: false });
				yield* telemetry.log("info", `Expanded sidebar panel: ${id}`);
			});

		// Atom: Get panels by position
		const getPanelsByPosition = (position: "left" | "right"): Effect.Effect<ReadonlyArray<SidebarPanel>, never> =>
			Effect.map(panels, (panels) => panels.filter((panel) => panel.position === position));

		yield* telemetry.log("info", "Sidebar service initialized");

		const service: SidebarService = {
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

		return service;
	}),
);

export default SidebarLive;
