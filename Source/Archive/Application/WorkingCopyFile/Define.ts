import type { IWorkingCopyFileService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import { Effect } from "effect";

export class WorkingCopyFileService extends Effect.Service<IWorkingCopyFileService>()(
	"workingCopyFileService",
	{ sync: () => ({}) as any },
) {}
