import type { IUntitledTextEditorService } from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { Effect } from "effect";

export class UntitledTextEditorService extends Effect.Service<IUntitledTextEditorService>()(
	"untitledTextEditorService",
	{ sync: () => ({}) as any },
) {}
