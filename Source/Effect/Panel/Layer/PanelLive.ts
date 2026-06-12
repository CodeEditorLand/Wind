/**
 * @module Effect/Panel/Layer/PanelLive
 * @description
 * Live layer for Panel service - plain mutable state, no Effect-TS runtime overhead.
 * @category Layer
 */

import PanelUpdateError from "../Error/PanelUpdateError.js";
import PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import type { PanelService } from "../Interface/PanelService.js";
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

	const GetView = (Id: string): PanelView | undefined =>
		_views.find((v) => v.id === Id);

	const Views: ReadonlyArray<PanelView> = _views;

	const OnViewsChanges = (listener: (views: ReadonlyArray<PanelView>) => void): (() => void) => {
		_viewsListeners.push(listener);
		return () => {
			const i = _viewsListeners.indexOf(listener);
			if (i >= 0) _viewsListeners.splice(i, 1);
		};
	};

	const OnActiveViewChanges = (listener: (id: string | undefined) => void): (() => void) => {
		_activeListeners.push(listener);
		return () => {
			const i = _activeListeners.indexOf(listener);
			if (i >= 0) _activeListeners.splice(i, 1);
		};
	};

	const GetActiveView: string | undefined = _activeView;

	const CreateView = (View: CreatePanelView): PanelView => {
		const Id = `panel-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;

		const NewView: PanelView = { ...View, id: Id };

		_views = [..._views, NewView].sort(
			(a, b) => a.priority - b.priority,
		);

		_viewsListeners.forEach((fn) => fn(_views));

		return NewView;
	};

	const UpdateView = (
		Id: string,

		updates: Partial<Omit<PanelView, "id">>,
	): void => {
		if (!_views.find((v) => v.id === Id))
			throw new PanelViewNotFoundError(Id);

		try {
			_views = _views
				.map((v) => (v.id === Id ? { ...v, ...updates } : v))
				.sort((a, b) => a.priority - b.priority);

			_viewsListeners.forEach((fn) => fn(_views));
		} catch (error) {
			throw new PanelUpdateError(Id, error);
		}
	};

	const RemoveView = (
		Id: string,
	): void => {
		if (!_views.find((v) => v.id === Id))
			throw new PanelViewNotFoundError(Id);

		_views = _views.filter((v) => v.id !== Id);

		if (_activeView === Id) {
			_activeView = undefined;

			_activeListeners.forEach((fn) => fn(undefined));
		}

		_viewsListeners.forEach((fn) => fn(_views));
	};

	const SetActiveView = (
		Id: string,
	): void => {
		if (!_views.find((v) => v.id === Id))
			throw new PanelViewNotFoundError(Id);

		_views = _views.map((v) =>
			v.id === Id ? { ...v, visible: true, maximized: false } : v,
		);

		_activeView = Id;

		_activeListeners.forEach((fn) => fn(Id));

		_viewsListeners.forEach((fn) => fn(_views));
	};

	const ShowView = (
		Id: string,
	): void =>
		UpdateView(Id, { visible: true });

	const HideView = (
		Id: string,
	): void =>
		UpdateView(Id, { visible: false });

	const ToggleView = (
		Id: string,
	): void => {
		const existing = _views.find((v) => v.id === Id);

		if (!existing) throw new PanelViewNotFoundError(Id);

		UpdateView(Id, { visible: !existing.visible });
	};

	const MaximizeView = (
		Id: string,
	): void => {
		if (!_views.find((v) => v.id === Id))
			throw new PanelViewNotFoundError(Id);

		_views = _views.map((v) => ({ ...v, maximized: v.id === Id }));
	};

	const RestoreView = (
		Id: string,
	): void =>
		UpdateView(Id, { maximized: false });

	const GetViewsByType = (
		Type: PanelViewType,
	): ReadonlyArray<PanelView> =>
		_views.filter((v) => v.type === Type);

	const GetVisibleViews: ReadonlyArray<PanelView> = _views.filter((v) => v.visible);

	const GetMaximizedView: PanelView | undefined = _views.find((v) => v.maximized);

	return {
		createView: CreateView,

		updateView: UpdateView,

		removeView: RemoveView,

		getView: GetView,

		views: Views,

		onViewsChanges: OnViewsChanges,

		setActiveView: SetActiveView,

		getActiveView: GetActiveView,

		onActiveViewChanges: OnActiveViewChanges,

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

export const LivePanelService = makePanelService();

export default LivePanelService;
