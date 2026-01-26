import type { IWorkspaceTrustManagementService } from "@codeeditorland/output/vs/platform/workspace/common/workspaceTrust.js";
import { Effect } from "effect";

import { CreateEmitter } from "../../Platform/Vscode/Type.js";

export class WorkSpaceTrustManagementService extends Effect.Service<IWorkspaceTrustManagementService>()(
	"workspaceTrustManagementService",
	{
		sync: () =>
			({
				onDidChangeTrust: CreateEmitter<void>().event,
				isWorkspaceTrusted: () => true,
			}) as any,
	},
) {}
