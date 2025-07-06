// Application/BrowserWorkbenchEnvironment/Define.ts
import { Effect } from "effect";
import type { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
export class BrowserWorkbenchEnvironmentService extends Effect.Service<IBrowserWorkbenchEnvironmentService>()("environmentService", { sync: () => ({}) as any }) {}

// Application/UserDataProfile/Define.ts
import { Effect } from "effect";
import type { IUserDataProfileService } from "@codeeditorland/output/vs/workbench/services/userDataProfile/common/userDataProfile.js";
export class UserDataProfileService extends Effect.Service<IUserDataProfileService>()("userDataProfileService", { sync: () => ({}) as any }) {}

// Application/RemoteAgent/Define.ts
import { Effect } from "effect";
import type { IRemoteAgentService } from "@codeeditorland/output/vs/workbench/services/remote/common/remoteAgentService.js";
export class RemoteAgentService extends Effect.Service<IRemoteAgentService>()("remoteAgentService", { sync: () => ({}) as any }) {}

// Application/Policy/Define.ts
import { Effect } from "effect";
import type { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
export class PolicyService extends Effect.Service<IPolicyService>()("policyService", { sync: () => ({}) as any }) {}
