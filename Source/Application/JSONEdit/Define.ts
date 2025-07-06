import type { IJSONEditingService } from "@codeeditorland/output/vs/workbench/services/configuration/common/jsonEditing.js";
import { Effect } from "effect";

export class JSONEditService extends Effect.Service<IJSONEditingService>()(
	"jsonEditingService",
	{ sync: () => ({}) as any },
) {}
