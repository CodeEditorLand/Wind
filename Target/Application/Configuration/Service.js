var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepmerge } from "deepmerge-ts";
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { joinPath } from "vs/base/common/resources.js";
import { ParseJson } from "Source/Integration/Tauri/File/ParseJson.js";
import { ReadRawFile } from "Source/Integration/Tauri/File/ReadRawFile.js";
import { ResolveFinalDefaultPath } from "Source/Integration/Tauri/Path/Default.js";
import { ResolveWorkSpacePath } from "Source/Integration/Tauri/Path/WorkSpace.js";
import { ApplicationConfigurationProblem } from "./Error.js";
const GetValueFromObject = /* @__PURE__ */ __name((ConfigurationObject, Key) => {
  if (typeof ConfigurationObject !== "object" || ConfigurationObject === null) {
    return void 0;
  }
  return Key.split(".").reduce(
    (Current, Part) => Current?.[Part],
    ConfigurationObject
  );
}, "GetValueFromObject");
class Configuration extends Effect.Service()(
  "vscode/ConfigurationService",
  {
    effect: Effect.gen(function* (Generator) {
      const ResolveConfigurationFile = /* @__PURE__ */ __name((ConfigDirectoryEffect, FileName) => Effect.flatMap(
        ConfigDirectoryEffect,
        (ConfigDirectory) => ReadRawFile(joinPath(ConfigDirectory, FileName)).pipe(
          Effect.flatMap(ParseJson),
          // If the file doesn't exist or is invalid, treat it as an empty object.
          Effect.catchAll(() => Effect.succeed({}))
        )
      ), "ResolveConfigurationFile");
      const ResolveConfiguration = Effect.all(
        {
          User: ResolveConfigurationFile(
            ResolveFinalDefaultPath(),
            "settings.json"
          ),
          WorkSpace: ResolveConfigurationFile(
            ResolveWorkSpacePath(),
            "settings.json"
          )
        },
        { concurrency: "unbounded" }
      ).pipe(
        Effect.map(({ User, WorkSpace }) => deepmerge(User, WorkSpace)),
        Effect.mapError(
          (Cause) => new ApplicationConfigurationProblem({
            Cause,
            Context: "FailedToResolveConfiguration"
          })
        )
      );
      const ConfigurationData = yield* Generator(ResolveConfiguration);
      const ServiceImplementation = {
        _serviceBrand: void 0,
        getValue(section, _overrides) {
          if (!section) {
            return ConfigurationData;
          }
          return GetValueFromObject(ConfigurationData, section);
        },
        updateValue: /* @__PURE__ */ __name(() => {
          console.warn(
            "IConfigurationService.updateValue is not implemented."
          );
          return Promise.resolve();
        }, "updateValue"),
        inspect: /* @__PURE__ */ __name((key, _overrides) => {
          const value = ServiceImplementation.getValue(
            key,
            _overrides
          );
          return {
            key,
            value,
            defaultValue: value,
            userValue: value,
            workspaceValue: value,
            workspaceFolderValue: value
          };
        }, "inspect"),
        keys: /* @__PURE__ */ __name(() => ({
          default: [],
          user: [],
          workspace: [],
          workspaceFolder: []
        }), "keys"),
        reloadConfiguration: /* @__PURE__ */ __name(() => Promise.resolve(), "reloadConfiguration"),
        onDidChangeConfiguration: new Emitter().event
      };
      return ServiceImplementation;
    })
  }
) {
  static {
    __name(this, "Configuration");
  }
}
export {
  Configuration
};
//# sourceMappingURL=Service.js.map
