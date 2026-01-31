import type { IWorkbenchAssignmentService } from "@codeeditorland/output/vs/workbench/services/assignment/common/assignmentService.js";
import { Effect } from "effect";

export class WorkbenchAssignmentService extends Effect.Service<IWorkbenchAssignmentService>()(
	"assignmentService",
	{ sync: () => ({}) as any },
) {}
