var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepmerge } from "deepmerge-ts";
import { Effect } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { joinPath } from "vs/base/common/resources.js";
import { ParseJSON } from "../../Integration/Tauri/File/ParseJSON.js";
import { ReadRawFile } from "../../Integration/Tauri/File/ReadRawFile.js";
import { ResolveFinalDefaultPath } from "../../Integration/Tauri/Path/Default.js";
import { ResolveWorkSpacePath } from "../../Integration/Tauri/Path/WorkSpace.js";
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
    effect: Effect.gen(function* () {
      const ResolveConfigurationFile = /* @__PURE__ */ __name((ConfigDirectoryEffect, FileName) => ConfigDirectoryEffect.pipe(
        Effect.flatMap(
          (ConfigDirectory) => ReadRawFile(joinPath(ConfigDirectory, FileName)).pipe(
            Effect.flatMap(ParseJSON),
            // If the file doesn't exist or is invalid, treat it as an empty object.
            Effect.catchAll(() => Effect.succeed({}))
          )
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
      const ConfigurationData = yield* ResolveConfiguration.pipe(
        Effect.catchAll(
          (error) => Effect.sync(() => {
            console.error(
              "Failed to load configuration, using empty default.",
              error
            );
            return {};
          })
        )
      );
      const ServiceImplementation = {
        _serviceBrand: void 0,
        getValue(...args) {
          let section = void 0;
          let overrides = void 0;
          if (args.length > 0) {
            if (typeof args[0] === "string") {
              section = args[0];
              if (typeof args[1] === "object") {
                overrides = args[1];
              }
            } else if (typeof args[0] === "object") {
              overrides = args[0];
            }
          }
          const _ = overrides;
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
        inspect: /* @__PURE__ */ __name((key, overrides) => {
          const value = ServiceImplementation.getValue(
            key,
            overrides
          );
          return {
            value,
            defaultValue: value,
            userValue: value,
            workspaceValue: value,
            workspaceFolderValue: value,
            default: void 0,
            user: void 0,
            workspace: void 0,
            workspaceFolder: void 0,
            memory: void 0,
            policy: void 0
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
