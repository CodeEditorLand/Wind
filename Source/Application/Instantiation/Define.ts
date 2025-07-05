import type { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { Effect } from "effect";

export class InstantiationService extends Effect.Service<IInstantiationService>()(
	"instantiationService",
	{
		sync: () =>
			({
				createInstance: (ctor: any, ...args: any[]) =>
					new ctor(...args),
			}) as any,
	},
) {}
