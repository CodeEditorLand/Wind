import { IFileService as a } from "vs/platform/files/common/files.js";
import { ILogService as v } from "vs/platform/log/common/log.js";
import { IPolicyService as f } from "vs/platform/policy/common/policy.js";
import { IUriIdentityService as S } from "vs/platform/uriIdentity/common/uriIdentity.js";

import { Effect as r } from "../../effect";

import "vs/platform/userDataProfile/common/userDataProfile.js";

import { WorkspaceService as p } from "vs/workbench/services/configuration/browser/configurationService.js";

import "vs/workbench/services/configuration/common/configuration.js";

import { IBrowserWorkbenchEnvironmentService as l } from "vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService as I } from "vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService as y } from "vs/workbench/services/userDataProfile/common/userDataProfile.js";

class F extends r.Service()("workspaceContextService", {
	effect: r.gen(function* () {
		const e = yield* l,
			o = yield* y,
			i = yield* a,
			t = yield* I,
			c = yield* S,
			n = yield* v,
			s = yield* f,
			m = {
				read: () => Promise.resolve(""),
				write: () => Promise.resolve(),
				remove: () => Promise.resolve(),
				needsCaching: () => !1,
			};
		return new p(
			{ remoteAuthority: e.remoteAuthority, configurationCache: m },
			e,
			o,
			{},
			i,
			t,
			c,
			n,
			s,
		);
	}),
}) {}
export { F as WorkSpaceService };
