import { Effect, Layer } from "effect";

import type {
	WorkbenchProductService,
	WorkbenchProductSnapshot,
} from "../Interface/WorkbenchProductService.js";
import type { WorkbenchProductProblem } from "../Type/WorkbenchProductProblem.js";
import type {
	WorkbenchProductBridgeShape,
	WorkbenchProductGlobals,
} from "./WorkbenchProductBridgeShape.js";
import { WorkbenchProductServiceTag } from "../Tag/WorkbenchProductServiceTag.js";

const ResolveBridge = Effect.sync(
	(): WorkbenchProductBridgeShape | null => {
		const Globals = globalThis as unknown as WorkbenchProductGlobals;
		return Globals.__CEL_SERVICES__?.Product ?? null;
	},
);

const Unavailable: WorkbenchProductProblem = {
	_tag: "WorkbenchProductBridgeUnavailable",
	reason: "globalThis.__CEL_SERVICES__.Product is null.",
};

export const WorkbenchProductLive = Layer.effect(
	WorkbenchProductServiceTag,
	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Snapshot: Effect.Effect<
			WorkbenchProductSnapshot,
			WorkbenchProductProblem
		> = Effect.gen(function* () {
			if (!Bridge) return yield* Effect.fail(Unavailable);
			return {
				nameLong: Bridge.nameLong,
				nameShort: Bridge.nameShort,
				version: Bridge.version,
				commit: Bridge.commit ?? null,
				date: Bridge.date ?? null,
				quality: Bridge.quality ?? null,
				applicationName: Bridge.applicationName,
				extensionsGallery: Bridge.extensionsGallery ?? null,
			};
		});

		const Get = <T = unknown>(
			Key: string,
		): Effect.Effect<T | undefined, WorkbenchProductProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				return Bridge[Key] as T | undefined;
			});

		const Service: WorkbenchProductService = { Snapshot, Get };
		return Service;
	}),
);

export default WorkbenchProductLive;
