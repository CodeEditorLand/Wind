import type { IWorkspaceContextService } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { Effect } from "effect";

export class WorkSpaceService extends Effect.Service<IWorkspaceContextService>()(
	"workspaceContextService",
	{ sync: () => ({}) as any },
) {}
