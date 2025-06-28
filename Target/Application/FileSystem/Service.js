var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "../../effect";
import {
} from "vscode";
import { HostService } from "Source/Application/Host/Service.js";
import { FileSystemProblem } from "./Error.js";
class FileSystemService extends Effect.Service()(
  "vscode/FileSystem",
  {
    effect: Effect.gen(function* (Generator) {
      const Host = yield* Generator(HostService);
      const CreateProxyEffect = /* @__PURE__ */ __name((Method, Context) => {
        return (...Arguments) => Host[Method](...Arguments).pipe(
          Effect.mapError(
            (Cause) => new FileSystemProblem({
              Cause,
              Context
            })
          )
        );
      }, "CreateProxyEffect");
      const StatEffect = CreateProxyEffect(
        "Stat",
        "StatFailed"
      );
      const ReadDirectoryEffect = CreateProxyEffect("ReadDirectory", "ReadDirectoryFailed");
      const CreateDirectoryEffect = CreateProxyEffect(
        "CreateDirectory",
        "CreateDirectoryFailed"
      );
      const ReadFileEffect = CreateProxyEffect(
        "ReadFile",
        "ReadFileFailed"
      );
      const WriteFileEffect = CreateProxyEffect(
        "WriteFile",
        "WriteFileFailed"
      );
      const DeleteEffect = CreateProxyEffect(
        "Delete",
        "DeleteFailed"
      );
      const RenameEffect = CreateProxyEffect(
        "Rename",
        "RenameFailed"
      );
      const CopyEffect = CreateProxyEffect(
        "Copy",
        "CopyFailed"
      );
      const ServiceImplementation = {
        stat: /* @__PURE__ */ __name((Uri) => Effect.runPromise(StatEffect(Uri)), "stat"),
        readDirectory: /* @__PURE__ */ __name((Uri) => Effect.runPromise(ReadDirectoryEffect(Uri)), "readDirectory"),
        createDirectory: /* @__PURE__ */ __name((Uri) => Effect.runPromise(CreateDirectoryEffect(Uri)), "createDirectory"),
        readFile: /* @__PURE__ */ __name((Uri) => Effect.runPromise(ReadFileEffect(Uri)), "readFile"),
        writeFile: /* @__PURE__ */ __name((Uri, Content) => Effect.runPromise(WriteFileEffect(Uri, Content)), "writeFile"),
        delete: /* @__PURE__ */ __name((Uri, Options) => Effect.runPromise(DeleteEffect(Uri, Options)), "delete"),
        rename: /* @__PURE__ */ __name((Source, Target, Options) => Effect.runPromise(RenameEffect(Source, Target, Options)), "rename"),
        copy: /* @__PURE__ */ __name((Source, Target, Options) => Effect.runPromise(CopyEffect(Source, Target, Options)), "copy"),
        isWritableFileSystem: /* @__PURE__ */ __name((_Scheme) => true, "isWritableFileSystem")
        // Assume all proxied are writable.
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "FileSystemService");
  }
}
export {
  FileSystemService
};
//# sourceMappingURL=Service.js.map
