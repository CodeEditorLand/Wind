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
		const TelemetryService = yield* Telemetry;

		// In-memory storage of sidebar panels as reactive ref
		const PanelsRef = yield* SubscriptionRef.make<ReadonlyArray<SidebarPanel>>([]);

		// Active panel state as reactive ref
		const ActivePanelRef = yield* SubscriptionRef.make<string | undefined>(undefined);

		// Atom: Create a new sidebar panel
		const CreatePanel = (Panel: CreateSidebarPanel): Effect.Effect<SidebarPanel, never> =>
			Effect.gen(function* () {
				const Id = `sidebar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
				const NewPanel: SidebarPanel = { ...Panel, id: Id };

				yield* SubscriptionRef.modify(PanelsRef, (Panels) => [undefined, [...Panels, NewPanel].sort((a, b) => a.priority - b.priority)]);

				yield* TelemetryService.log("info", `Created sidebar panel: ${Id}`);
				return NewPanel;
			});

		// Atom: Update an existing sidebar panel
		const UpdatePanel = (
			Id: string,
			updates: Partial<Omit<SidebarPanel, "id">>,
		): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				const Existing = yield* GetPanel(Id);

				if (!Existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
				}

				try {
					yield* SubscriptionRef.modify(PanelsRef, (Panels) => [
						undefined,
						Panels.map((Panel) => (Panel.id === Id ? { ...Panel, ...updates } : Panel)).sort((a, b) => a.priority - b.priority),
					]);

					yield* TelemetryService.log("info", `Updated sidebar panel: ${Id}`);
				} catch (error) {
					return yield* Effect.fail(new SidebarUpdateError(Id, error));
				}
			});

		// Atom: Remove a sidebar panel
		const RemovePanel = (Id: string): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const Existing = yield* GetPanel(Id);

				if (!Existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
				}

				yield* SubscriptionRef.modify(PanelsRef, (Panels) => [undefined, Panels.filter((Panel) => Panel.id !== Id)]);

				// Clear active state if this was the active panel
				const CurrentActive = yield* ActivePanelRef.get;
				if (CurrentActive === Id) {
					yield* SubscriptionRef.set(ActivePanelRef, undefined);
				}

				yield* TelemetryService.log("info", `Removed sidebar panel: ${Id}`);
			});

		// Atom: Get a specific sidebar panel
		const GetPanel = (Id: string): Effect.Effect<SidebarPanel | undefined, never> =>
			Effect.map(PanelsRef.get, (Panels) => Panels.find((Panel) => Panel.id === Id));

		// Atom: Get all sidebar panels
		const Panels = PanelsRef.get;

		// Atom: Stream of panels changes
		const PanelsChanges = PanelsRef.changes;

		// Atom: Set active panel
		const SetActivePanel = (Id: string): Effect.Effect<void, SidebarPanelNotFoundError> =>
			Effect.gen(function* () {
				const Existing = yield* GetPanel(Id);

				if (!Existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
				}

				// Expand the panel when setting it as active
				yield* SubscriptionRef.modify(PanelsRef, (Panels) => [undefined, Panels.map((Panel) => (Panel.id === Id ? { ...Panel, collapsed: false } : Panel))]);

				yield* SubscriptionRef.set(ActivePanelRef, Id);
				yield* TelemetryService.log("info", `Set active sidebar panel: ${Id}`);
			});

		// Atom: Get active panel
		const GetActivePanel = ActivePanelRef.get;

		// Atom: Stream of active panel changes
		const ActivePanelChanges = ActivePanelRef.changes;

		// Atom: Toggle panel
		const TogglePanel = (Id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				const Existing = yield* GetPanel(Id);

				if (!Existing) {
					return yield* Effect.fail(new SidebarPanelNotFoundError(Id));
				}

				yield* UpdatePanel(Id, { collapsed: !Existing.collapsed });
				yield* TelemetryService.log("info", `Toggled sidebar panel: ${Id}`);
			});

		// Atom: Collapse panel
		const CollapsePanel = (Id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* UpdatePanel(Id, { collapsed: true });
				yield* TelemetryService.log("info", `Collapsed sidebar panel: ${Id}`);
			});

		// Atom: Expand panel
		const ExpandPanel = (Id: string): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
			Effect.gen(function* () {
				yield* UpdatePanel(Id, { collapsed: false });
				yield* TelemetryService.log("info", `Expanded sidebar panel: ${Id}`);
			});

		// Atom: Get panels by position
		const GetPanelsByPosition = (Position: "left" | "right"): Effect.Effect<ReadonlyArray<SidebarPanel>, never> =>
			Effect.map(Panels, (Panels) => Panels.filter((Panel) => Panel.position === Position));

		yield* TelemetryService.log("info", "Sidebar service initialized");

		const service: SidebarService = {
			createPanel: CreatePanel,
			updatePanel: UpdatePanel,
			removePanel: RemovePanel,
			getPanel: GetPanel,
			panels: Panels,
			panelsChanges: PanelsChanges,
			setActivePanel: SetActivePanel,
			getActivePanel: GetActivePanel,
			activePanelChanges: ActivePanelChanges,
			togglePanel: TogglePanel,
			collapsePanel: CollapsePanel,
			expandPanel: ExpandPanel,
			getPanelsByPosition: GetPanelsByPosition,
		};

		return service;
	}),
);

export default SidebarLive;
