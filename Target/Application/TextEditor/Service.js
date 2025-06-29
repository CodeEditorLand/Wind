var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";
import { ITextFileService as VSCodeTextFileService } from "vs/workbench/services/textfile/common/textfiles.js";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import { HostService } from "../../Application/Host/Service.js";
import { TextEditorProblem } from "./Error.js";
class TextEditorService extends Effect.Service()(
  "textFileService",
  {
    effect: Effect.gen(function* (Generator) {
      const InstantiationService = yield* Generator(
        IInstantiationService
      );
      const Host = yield* Generator(HostService);
      const LoggerService = yield* Generator(ILogService);
      const ServiceInstance = InstantiationService.createInstance(
        VSCodeTextFileService,
        {},
        {},
        {},
        InstantiationService,
        {},
        {},
        {},
        LoggerService
      );
      ServiceInstance.save = async (Resource, Options) => {
        const TargetResource = "resource" in Resource ? Resource.resource : Resource;
        if (!TargetResource) {
          const ErrorMessage = "TextFileService.save called but no resource was found.";
          LoggerService.warn(`[TextFileService] ${ErrorMessage}`);
          throw new Error(ErrorMessage);
        }
        LoggerService.info(
          `[TextFileService] Invoking 'Host.SaveFile' for URI: ${TargetResource.toString()}`
        );
        const SaveEffect = Host.SaveFile(TargetResource, Options).pipe(
          Effect.mapError(
            (Cause) => new TextEditorProblem({
              Cause,
              Context: "SaveFileFailed"
            })
          )
        );
        return Effect.runPromise(SaveEffect).then(() => true);
      };
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "TextEditorService");
  }
}
export {
  TextEditorService
};
//# sourceMappingURL=Service.js.map
