import { Effect, Layer, Ref, Runtime } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import type { IDisposable } from "vs/base/common/lifecycle.js";
import type { IProgressIndicator } from "vs/platform/progress/common/progress.js";
import { StorageScope } from "vs/platform/storage/common/storage.js";
import type { PaneCompositeDescriptor } from "vs/workbench/browser/panecomposite.js";
import type { IPaneComposite } from "vs/workbench/common/panecomposite.js";
import type {
	IViewDescriptorService,
	ViewContainer,
	ViewContainerLocation,
} from "vs/workbench/common/views.js";
import {
	IWorkbenchLayoutService,
	Parts,
} from "vs/workbench/services/layout/browser/layoutService.js";
import type { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite.js";

import { LayoutServiceTag } from "../Layout.js";
import { StorageServiceTag } from "../Storage.js";
import { ViewDescriptorServiceTag } from "../Views.js";

const ServiceRuntime = Runtime.defaultRuntime;

const GetLastActiveIdKey = (Location: ViewContainerLocation): string =>
	`workbench.panecomposite.${Location}.lastactive`;

class TauriPaneCompositePartService implements IPaneCompositePartService {
	readonly _serviceBrand: undefined;

	private readonly _onDidPaneCompositeOpen = new Emitter<{
		composite: IPaneComposite;
		viewContainerLocation: ViewContainerLocation;
	}>();
	readonly onDidPaneCompositeOpen: Event<{
		composite: IPaneComposite;
		viewContainerLocation: ViewContainerLocation;
	}> = this._onDidPaneCompositeOpen.event;

	private readonly _onDidPaneCompositeClose = new Emitter<{
		composite: IPaneComposite;
		viewContainerLocation: ViewContainerLocation;
	}>();
	readonly onDidPaneCompositeClose: Event<{
		composite: IPaneComposite;
		viewContainerLocation: ViewContainerLocation;
	}> = this._onDidPaneCompositeClose.event;

	private readonly ActivePaneComposites: Map<
		ViewContainerLocation,
		Ref.Ref<string | undefined>
	>;
	private readonly PaneCompositeParts: Map<
		ViewContainerLocation,
		Parts.SIDEBAR_PART | Parts.PANEL_PART | Parts.AUXILIARYBAR_PART
	>;

	constructor() {
		this.ActivePaneComposites = new Map();
		this.PaneCompositeParts = new Map();

		this.PaneCompositeParts.set(
			ViewContainerLocation.Sidebar,
			Parts.SIDEBAR_PART,
		);
		this.PaneCompositeParts.set(
			ViewContainerLocation.Panel,
			Parts.PANEL_PART,
		);
		this.PaneCompositeParts.set(
			ViewContainerLocation.AuxiliaryBar,
			Parts.AUXILIARYBAR_PART,
		);

		this.PaneCompositeParts.forEach((_, Location) => {
			this.ActivePaneComposites.set(Location, Ref.unsafeMake(undefined));
		});

		// A real implementation would hydrate the active composites from storage here.
	}

	private RunEffect = <A, E>(eff: Effect.Effect<A, E, any>): Promise<A> => {
		// A full implementation requires providing all necessary services via Layers.
		return Runtime.runPromise(ServiceRuntime, eff as any);
	};

	openPaneComposite(
		Id: string | undefined,
		Location: ViewContainerLocation,
		Focus?: boolean,
	): Promise<IPaneComposite | undefined> {
		return this.RunEffect(
			Effect.gen(function* (_) {
				const LayoutService = yield* _(LayoutServiceTag);
				const ViewDescriptorService = yield* _(
					ViewDescriptorServiceTag,
				);
				const StorageService = yield* _(StorageServiceTag);

				const Part = this.PaneCompositeParts.get(Location);
				if (!Part) {
					return undefined;
				}

				const PaneCompositeId =
					Id ?? this.getLastActivePaneCompositeId(Location);
				if (!PaneCompositeId) {
					return undefined;
				}

				const ActivePaneCompositeIdRef =
					this.ActivePaneComposites.get(Location)!;
				yield* _(Ref.set(ActivePaneCompositeIdRef, PaneCompositeId));

				yield* _(
					Effect.sync(() => LayoutService.setPartHidden(false, Part)),
				);

				if (Focus) {
					yield* _(Effect.sync(() => LayoutService.focusPart(Part)));
				}

				// This service cannot return the actual IPaneComposite instance without access
				// to the underlying UI components. We return a stub for API compliance.
				const StubbedComposite: IPaneComposite = {
					getId: () => PaneCompositeId,
					getTitle: () => "",
					openView: () => undefined,
					getViewPaneContainer: () => undefined,
					focus: () => {},
				} as any;

				this._onDidPaneCompositeOpen.fire({
					composite: StubbedComposite,
					viewContainerLocation: Location,
				});

				yield* _(
					Effect.sync(() =>
						StorageService.store(
							GetLastActiveIdKey(Location),
							PaneCompositeId,
							StorageScope.WORKSPACE,
							1 /* MACHINE */,
						),
					),
				);

				return StubbedComposite;
			}).pipe(Effect.catchAll(() => Effect.succeed(undefined))),
		);
	}

	getActivePaneComposite(
		Location: ViewContainerLocation,
	): IPaneComposite | undefined {
		// This requires access to the UI components, so we return undefined.
		return undefined;
	}

	getPaneComposite(
		Id: string,
		Location: ViewContainerLocation,
	): PaneCompositeDescriptor | undefined {
		// This requires access to the registry, so we return undefined.
		return undefined;
	}

	getPaneComposites(
		Location: ViewContainerLocation,
	): PaneCompositeDescriptor[] {
		return [];
	}

	getPinnedPaneCompositeIds(Location: ViewContainerLocation): string[] {
		return [];
	}

	getVisiblePaneCompositeIds(Location: ViewContainerLocation): string[] {
		const ActiveId = Effect.runSync(
			Ref.get(this.ActivePaneComposites.get(Location)!),
		);
		return ActiveId ? [ActiveId] : [];
	}

	getPaneCompositeIds(Location: ViewContainerLocation): string[] {
		return [];
	}

	getProgressIndicator(
		Id: string,
		Location: ViewContainerLocation,
	): IProgressIndicator | undefined {
		return undefined;
	}

	hideActivePaneComposite(Location: ViewContainerLocation): void {
		this.RunEffect(
			Effect.gen(function* (_) {
				const LayoutService = yield* _(LayoutServiceTag);
				const Part = this.PaneCompositeParts.get(Location);
				if (Part) {
					yield* _(
						Effect.sync(() =>
							LayoutService.setPartHidden(true, Part),
						),
					);
				}
			}),
		);
	}

	getLastActivePaneCompositeId(Location: ViewContainerLocation): string {
		const StorageService = Effect.runSync(Effect.context<any>()).get(
			StorageServiceTag,
		);
		return (
			StorageService.get(
				GetLastActiveIdKey(Location),
				StorageScope.WORKSPACE,
			) ?? ""
		);
	}
}

const Definition = Effect.sync(() => new TauriPaneCompositePartService());
export default Definition;
