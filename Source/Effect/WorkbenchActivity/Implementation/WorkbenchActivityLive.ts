import type {
	WorkbenchActivityBadge,
	WorkbenchActivityService,
} from "../Interface/WorkbenchActivityService.js";

import { WorkbenchActivityError } from "../Type/WorkbenchActivityProblem.js";

import type {
	UpstreamWorkbenchBadge,
	WorkbenchActivityBridgeShape,
	WorkbenchActivityGlobals,
} from "./WorkbenchActivityBridgeShape.js";

const Unavailable = (): WorkbenchActivityError =>
	new WorkbenchActivityError({
		_tag: "WorkbenchActivityBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Activity is null.",
	});

const Disposables = new Map<string, { readonly dispose: () => void }>();

const ToBadge = (badge: WorkbenchActivityBadge): UpstreamWorkbenchBadge => {
	if (typeof badge.count === "number") {
		return {
			number: badge.count,

			getDescription: () => badge.text ?? `${badge.count}`,
		};
	}

	return {
		text: badge.text ?? "",

		getDescription: () => badge.text ?? "",
	};
};

function makeWorkbenchActivityService(): WorkbenchActivityService {
	const getBridge = (): WorkbenchActivityBridgeShape | null =>
		(globalThis as unknown as WorkbenchActivityGlobals).__CEL_SERVICES__
			?.Activity ?? null;

	const ShowBadge = (
		Badge: WorkbenchActivityBadge,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Disposable = Bridge.showViewContainerActivity(
			Badge.viewContainerId,

			{
				badge: ToBadge(Badge),
				...(Badge.priority !== undefined
					? { priority: Badge.priority }
					: {}),
			},
		);

		Disposables.set(Badge.viewContainerId, Disposable);

		return Disposable;
	};

	const Clear = (ViewContainerId: string): void => {
		const Disposable = Disposables.get(ViewContainerId);

		if (Disposable) {
			Disposable.dispose();

			Disposables.delete(ViewContainerId);
		}
	};

	const Service: WorkbenchActivityService = { ShowBadge, Clear };

	return Service;
}

export const WorkbenchActivityLive = makeWorkbenchActivityService();

export default WorkbenchActivityLive;
