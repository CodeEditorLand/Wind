import { Effect } from "effect";

import type {
	WorkbenchProductService,
	WorkbenchProductSnapshot,
} from "../Interface/WorkbenchProductService.js";
import type { WorkbenchProductProblem } from "../Type/WorkbenchProductProblem.js";
import type {
	WorkbenchProductBridgeShape,
	WorkbenchProductGlobals,
} from "./WorkbenchProductBridgeShape.js";

const Unavailable: WorkbenchProductProblem = {
	_tag: "WorkbenchProductBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Product is null.",
};

function makeWorkbenchProductService(): WorkbenchProductService {
	const getBridge = (): WorkbenchProductBridgeShape | null =>
		(globalThis as unknown as WorkbenchProductGlobals).__CEL_SERVICES__
			?.Product ?? null;

	const Snapshot: Effect.Effect<
		WorkbenchProductSnapshot,
		WorkbenchProductProblem
	> = Effect.gen(function* () {
		const Bridge = getBridge();

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
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			return Bridge[Key] as T | undefined;
		});

	const Service: WorkbenchProductService = { Snapshot, Get };

	return Service;
}

export const WorkbenchProductLive = makeWorkbenchProductService();

export default WorkbenchProductLive;
