/**
 * @module Effect/Panel/Layer/PanelLive
 * @description
 * Live layer for Panel service - plain mutable state, no Effect-TS runtime overhead.
 * @category Layer
 */

import { Effect, Either, Layer, Stream } from "effect";

import PanelUpdateError from "../Error/PanelUpdateError.js";
import PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import type { PanelService } from "../Interface/PanelService.js";
import PanelTag from "../Tag/PanelTag.js";
import type {
	CreatePanelView,
	PanelView,
	PanelViewType,
} from "../Type/PanelType.js";

function makePanelService(): PanelService {
	let _views: ReadonlyArray<PanelView> = [];

	let _activeView: string | undefined = undefined;

	const _viewsListeners: ((v: ReadonlyArray<PanelView>) => void)[] = [];

	const _activeListeners: ((v: string | undefined) => void)[] = [];

	const GetView = (Id: string): Effect.Effect<PanelView | undefined> =>
		Effect.succeed(_views.find((v) => v.id === Id));

	const Views = Effect.suspend(() => Effect.succeed(_views));

	const ViewsChanges: Stream.Stream<ReadonlyArray<PanelView>> =
		Stream.asyncInterrupt<ReadonlyArray<PanelView>>((emit) => {
			const fn = (v: ReadonlyArray<PanelView>) => emit.single(v);

			_viewsListeners.push(fn);

			return Either.left(
				Effect.sync(() => {
					const i = _viewsListeners.indexOf(fn);

					if (i >= 0) _viewsListeners.splice(i, 1);
				}),
			);
		});

	const ActiveViewChanges: Stream.Stream<string | undefined> =
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

	const GetActiveView: Effect.Effect<string | undefined> = Effect.suspend(
		() => Effect.succeed(_activeView),
	);

	const CreateView = (View: CreatePanelView): Effect.Effect<PanelView> =>
		Effect.sync(() => {
			const Id = `panel-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2, 9)}`;

			const NewView: PanelView = { ...View, id: Id };

			_views = [..._views, NewView].sort(
				(a, b) => a.priority - b.priority,
			);

			_viewsListeners.forEach((fn) => fn(_views));

			return NewView;
		});

	const UpdateView = (
		Id: string,

		updates: Partial<Omit<PanelView, "id">>,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> => {
		if (!_views.find((v) => v.id === Id))
			return Effect.fail(new PanelViewNotFoundError(Id));

		try {
			_views = _views
				.map((v) => (v.id === Id ? { ...v, ...updates } : v))
				.sort((a, b) => a.priority - b.priority);

			_viewsListeners.forEach((fn) => fn(_views));

			return Effect.void;
		} catch (error) {
			return Effect.fail(new PanelUpdateError(Id, error));
		}
	};

	const RemoveView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError> => {
		if (!_views.find((v) => v.id === Id))
			return Effect.fail(new PanelViewNotFoundError(Id));

		_views = _views.filter((v) => v.id !== Id);

		if (_activeView === Id) {
			_activeView = undefined;

			_activeListeners.forEach((fn) => fn(undefined));
		}

		_viewsListeners.forEach((fn) => fn(_views));

		return Effect.void;
	};

	const SetActiveView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError> => {
		if (!_views.find((v) => v.id === Id))
			return Effect.fail(new PanelViewNotFoundError(Id));

		_views = _views.map((v) =>
			v.id === Id ? { ...v, visible: true, maximized: false } : v,
		);

		_activeView = Id;

		_activeListeners.forEach((fn) => fn(Id));

		_viewsListeners.forEach((fn) => fn(_views));

		return Effect.void;
	};

	const ShowView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
		UpdateView(Id, { visible: true });

	const HideView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
		UpdateView(Id, { visible: false });

	const ToggleView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> => {
		const existing = _views.find((v) => v.id === Id);

		if (!existing) return Effect.fail(new PanelViewNotFoundError(Id));

		return UpdateView(Id, { visible: !existing.visible });
	};

	const MaximizeView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> => {
		if (!_views.find((v) => v.id === Id))
			return Effect.fail(new PanelViewNotFoundError(Id));

		_views = _views.map((v) => ({ ...v, maximized: v.id === Id }));

		return Effect.void;
	};

	const RestoreView = (
		Id: string,
	): Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError> =>
		UpdateView(Id, { maximized: false });

	const GetViewsByType = (
		Type: PanelViewType,
	): Effect.Effect<ReadonlyArray<PanelView>> =>
		Effect.succeed(_views.filter((v) => v.type === Type));

	const GetVisibleViews: Effect.Effect<ReadonlyArray<PanelView>> =
		Effect.suspend(() => Effect.succeed(_views.filter((v) => v.visible)));

	const GetMaximizedView: Effect.Effect<PanelView | undefined> =
		Effect.suspend(() => Effect.succeed(_views.find((v) => v.maximized)));

	return {
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
	} satisfies PanelService;
}

const PanelLive = Layer.succeed(PanelTag, makePanelService());

export default PanelLive;
