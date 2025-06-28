var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Runtime } from "../../effect";
import {
  HasResourceList,
  ReadImage,
  ReadResourceList,
  ReadText,
  WriteResourceList,
  WriteText
} from "Source/Integration/Tauri/Clipboard/Wrapper.js";
import { ApplicationClipboardProblem } from "./Error.js";
class Clipboard extends Effect.Service()(
  "vscode/ClipboardService",
  {
    effect: Effect.gen(function* (Generator) {
      const AppRuntime = yield* Generator(Effect.runtime());
      const RunIntegrationEffect = /* @__PURE__ */ __name((IntegrationEffect) => {
        const MappedEffect = Effect.mapError(
          IntegrationEffect,
          (Cause) => new ApplicationClipboardProblem({ Cause })
        );
        return Runtime.runPromise(AppRuntime, MappedEffect);
      }, "RunIntegrationEffect");
      const ServiceImplementation = {
        _serviceBrand: void 0,
        writeText: /* @__PURE__ */ __name((Text) => RunIntegrationEffect(WriteText(Text)), "writeText"),
        readText: /* @__PURE__ */ __name(() => RunIntegrationEffect(ReadText()), "readText"),
        readFindText: /* @__PURE__ */ __name(() => RunIntegrationEffect(ReadText()), "readFindText"),
        writeFindText: /* @__PURE__ */ __name((Text) => RunIntegrationEffect(WriteText(Text)), "writeFindText"),
        writeResources: /* @__PURE__ */ __name((ResourceList) => RunIntegrationEffect(WriteResourceList(ResourceList)), "writeResources"),
        readResources: /* @__PURE__ */ __name(() => RunIntegrationEffect(ReadResourceList()), "readResources"),
        hasResources: /* @__PURE__ */ __name(() => RunIntegrationEffect(HasResourceList()), "hasResources"),
        readImage: /* @__PURE__ */ __name(() => RunIntegrationEffect(ReadImage()), "readImage"),
        triggerPaste: /* @__PURE__ */ __name((_TargetWindowId) => {
          console.warn(
            "IClipboardService.triggerPaste is not implemented."
          );
          return void 0;
        }, "triggerPaste")
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "Clipboard");
  }
}
export {
  Clipboard
};
//# sourceMappingURL=Service.js.map
