import "../../effect";
import "vs/platform/files/common/files.js";
import "vs/platform/log/common/log.js";
import "vs/platform/policy/common/policy.js";
import "vs/platform/uriIdentity/common/uriIdentity.js";
import "vs/workbench/services/environment/browser/environmentService.js";
import "vs/workbench/services/remote/common/remoteAgentService.js";
import "vs/workbench/services/userDataProfile/common/userDataProfile.js";

import { WorkSpaceService as e } from "./Service.js";

const s = e.Default;
export { s as WorkSpaceLive };
