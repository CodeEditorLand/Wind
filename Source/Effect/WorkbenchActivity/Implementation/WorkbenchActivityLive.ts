import { Effect, Layer } from "effect";

import type {
	WorkbenchActivityBadge,
	WorkbenchActivityService,
} from "../Interface/WorkbenchActivityService.js";
import type { WorkbenchActivityProblem } from "../Type/WorkbenchActivityProblem.js";
import type {
	UpstreamWorkbenchBadge,
	WorkbenchActivityBridgeShape,
	WorkbenchActivityGlobals,
} from "./WorkbenchActivityBridgeShape.js";
import { WorkbenchActivityServiceTag } from "../Tag/WorkbenchActivityServiceTag.js";

const ResolveBridge = Effect.sync(
	(): WorkbenchActivityBridgeShape | null => {
		const Globals = globalThis as unknown as WorkbenchActivityGlobals;
		return Globals.__CEL_SERVICES__?.Activity ?? null;
	},
);

const Unavailable: WorkbenchActivityProblem = {
	_tag: "WorkbenchActivityBridgeUnavailable",
	reason: "globalThis.__CEL_SERVICES__.Activity is null.",
};

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

export const WorkbenchActivityLive = Layer.effect(
	WorkbenchActivityServiceTag,
	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const ShowBadge = (
			Badge: WorkbenchActivityBadge,
		): Effect.Effect<
			{ readonly dispose: () => void },
			WorkbenchActivityProblem
		> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				const Disposable = Bridge.showViewContainerActivity(
					Badge.viewContainerId,
					{
						badge: ToBadge(Badge),
						priority: Badge.priority,
					},
				);
				Disposables.set(Badge.viewContainerId, Disposable);
				return Disposable;
			});

		const Clear = (
			ViewContainerId: string,
		): Effect.Effect<void, WorkbenchActivityProblem> =>
			Effect.sync(() => {
				const Disposable = Disposables.get(ViewContainerId);
				if (Disposable) {
					Disposable.dispose();
					Disposables.delete(ViewContainerId);
				}
			});

		const Service: WorkbenchActivityService = { ShowBadge, Clear };
		return Service;
	}),
);

export default WorkbenchActivityLive;
