import "../../effect";
import "vs/platform/files/common/files.js";
import "vs/platform/instantiation/common/instantiation.js";
import "vs/platform/log/common/log.js";
import "vs/platform/uriIdentity/common/uriIdentity.js";
import "vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import "vs/workbench/services/lifecycle/common/lifecycle.js";
import "vs/workbench/services/untitled/common/untitledTextEditorService.js";
import "vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import "../Host/Service.js";

import { TextEditorService as e } from "./Service.js";

const E = e.Default;
export { E as TextEditorLive };
