import type { IContextKeyService } from "@codeeditorland/output/vs/platform/contextkey/common/contextkey.js";
import { Effect } from "effect";

export class ContextKeyService extends Effect.Service<IContextKeyService>()(
	"contextKeyService",
	{ sync: () => ({}) as any },
) {}
