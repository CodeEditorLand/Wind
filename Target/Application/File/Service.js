var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import { Schemas } from "vs/base/common/network.js";
import { FileService as VSCodeFileService } from "vs/platform/files/common/fileService.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { FileSystemService } from "../FileSystem/Service.js";
class FileService extends Effect.Service()(
  "vscode/FileService",
  {
    effect: Effect.gen(function* (Generator) {
      const LoggerService = yield* Generator(ILogService);
      const FileSystemProvider = yield* Generator(FileSystemService);
      const ServiceInstance = new VSCodeFileService(LoggerService);
      ServiceInstance.registerProvider(Schemas.file, FileSystemProvider);
      return ServiceInstance;
    })
  }
) {
  static {
    __name(this, "FileService");
  }
}
export {
  FileService
};
//# sourceMappingURL=Service.js.map
