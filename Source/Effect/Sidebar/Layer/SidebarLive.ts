/**
 * @module Effect/Sidebar/Layer/SidebarLive
 * @description
 * Live layer for Sidebar service - plain mutable state, no Effect-TS runtime.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @category Layer
 */

import { Effect, Either, Layer, Stream } from "effect";

import SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";
import SidebarUpdateError from "../Error/SidebarUpdateError.js";
import type { SidebarService } from "../Interface/SidebarService.js";
import SidebarTag from "../Tag/SidebarTag.js";
import type { CreateSidebarPanel, SidebarPanel } from "../Type/SidebarType.js";

function makeService(): SidebarService {
	let _panels: ReadonlyArray<SidebarPanel> = [];

	let _activePanel: string | undefined = undefined;

	const _panelsListeners: ((v: ReadonlyArray<SidebarPanel>) => void)[] = [];

	const _activeListeners: ((v: string | undefined) => void)[] = [];

	const GetPanel = (Id: string): Effect.Effect<SidebarPanel | undefined> =>
		Effect.succeed(_panels.find((p) => p.id === Id));

	const Panels = Effect.suspend(() => Effect.succeed(_panels));

	const PanelsChanges: Stream.Stream<ReadonlyArray<SidebarPanel>> =
		Stream.asyncInterrupt<ReadonlyArray<SidebarPanel>>((emit) => {
			const fn = (v: ReadonlyArray<SidebarPanel>) => emit.single(v);

			_panelsListeners.push(fn);

			return Either.left(
				Effect.sync(() => {
					const i = _panelsListeners.indexOf(fn);

					if (i >= 0) _panelsListeners.splice(i, 1);
				}),
			);
		});

	const ActivePanelChanges: Stream.Stream<string | undefined> =
		Stream.asyncInterrupt<string | undefined>((emit) => {
			const fn = (v: string | undefined) => emit.single(v);

			_activeListeners.push(fn);

			return Either.left(
				Effect.sync(() => {
					const i = _activeListeners.indexOf(fn);

					if (i >= 0) _activeListeners.splice(i, 1);
				}),
			);
		});

	const GetActivePanel: Effect.Effect<string | undefined> = Effect.suspend(
		() => Effect.succeed(_activePanel),
	);

	const CreatePanel = (
		Panel: CreateSidebarPanel,
	): Effect.Effect<SidebarPanel> =>
		Effect.sync(() => {
			const Id = `sidebar-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 9)}`;

			const NewPanel: SidebarPanel = { ...Panel, id: Id };

			_panels = [..._panels, NewPanel].sort(
				(a, b) => a.priority - b.priority,
			);

			_panelsListeners.forEach((fn) => fn(_panels));

			return NewPanel;
		});

	const UpdatePanel = (
		Id: string,

		updates: Partial<Omit<SidebarPanel, "id">>,
	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> => {
		const existing = _panels.find((p) => p.id === Id);

		if (!existing) return Effect.fail(new SidebarPanelNotFoundError(Id));

		try {
			_panels = _panels
				.map((p) => (p.id === Id ? { ...p, ...updates } : p))
				.sort((a, b) => a.priority - b.priority);

			_panelsListeners.forEach((fn) => fn(_panels));

			return Effect.void;
		} catch (error) {
			return Effect.fail(new SidebarUpdateError(Id, error));
		}
	};

	const RemovePanel = (
		Id: string,
	): Effect.Effect<void, SidebarPanelNotFoundError> => {
		if (!_panels.find((p) => p.id === Id))
			return Effect.fail(new SidebarPanelNotFoundError(Id));

		_panels = _panels.filter((p) => p.id !== Id);

		if (_activePanel === Id) {
			_activePanel = undefined;

			_activeListeners.forEach((fn) => fn(undefined));
		}

		_panelsListeners.forEach((fn) => fn(_panels));

		return Effect.void;
	};

	const SetActivePanel = (
		Id: string,
	): Effect.Effect<void, SidebarPanelNotFoundError> => {
		if (!_panels.find((p) => p.id === Id))
			return Effect.fail(new SidebarPanelNotFoundError(Id));

		_panels = _panels.map((p) =>
			p.id === Id ? { ...p, collapsed: false } : p,
		);

		_activePanel = Id;

		_activeListeners.forEach((fn) => fn(Id));

		_panelsListeners.forEach((fn) => fn(_panels));

		return Effect.void;
	};

	const TogglePanel = (
		Id: string,
	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> => {
		const existing = _panels.find((p) => p.id === Id);

		if (!existing) return Effect.fail(new SidebarPanelNotFoundError(Id));

		return UpdatePanel(Id, { collapsed: !existing.collapsed });
	};

	const CollapsePanel = (
		Id: string,
	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
		UpdatePanel(Id, { collapsed: true });

	const ExpandPanel = (
		Id: string,
	): Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError> =>
		UpdatePanel(Id, { collapsed: false });

	const GetPanelsByPosition = (
		Position: "left" | "right",
	): Effect.Effect<ReadonlyArray<SidebarPanel>> =>
		Effect.succeed(_panels.filter((p) => p.position === Position));

	return {
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
	} satisfies SidebarService;
}

const SidebarLive = Layer.succeed(SidebarTag, makeService());

export default SidebarLive;
