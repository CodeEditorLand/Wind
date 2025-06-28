import { Layer } from "../../effect";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { SourceControlManagementService } from "./Service.js";
const SourceControlManagementLive = SourceControlManagementService.Default;
export {
  SourceControlManagementLive
};
//# sourceMappingURL=Live.js.map
