import type { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import { Effect } from "effect";

export class LifecycleService extends Effect.Service<ILifecycleService>()(
	"lifecycleService",
	{ sync: () => ({}) as any },
) {}
