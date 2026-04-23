var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepmerge } from "deepmerge-ts";
import * as Environment from "../Constant/EnvironmentConstant.js";
import BaseConfig from "./BaseConfig.js";
const PostHogDefines = {
  "import.meta.env.LAND_POSTHOG_KEY": JSON.stringify(
    process.env["LAND_POSTHOG_KEY"] ?? ""
  ),
  "import.meta.env.LAND_POSTHOG_HOST": JSON.stringify(
    process.env["LAND_POSTHOG_HOST"] ?? "https://eu.i.posthog.com"
  ),
  "import.meta.env.LAND_POSTHOG_WIND_ENABLED": JSON.stringify(
    process.env["LAND_POSTHOG_WIND_ENABLED"] ?? "true"
  ),
  "import.meta.env.LAND_POSTHOG_SESSION_RECORDING": JSON.stringify(
    process.env["LAND_POSTHOG_SESSION_RECORDING"] ?? "false"
  ),
  "import.meta.env.LAND_POSTHOG_SURVEYS": JSON.stringify(
    process.env["LAND_POSTHOG_SURVEYS"] ?? "false"
  ),
  "import.meta.env.LAND_POSTHOG_DISTINCT_ID": JSON.stringify(
    process.env["LAND_POSTHOG_DISTINCT_ID"] ?? ""
  )
};
async function targetConfig(Current) {
  const merged = deepmerge(BaseConfig, {
    outdir: "Target",
    drop: Environment.On ? [] : ["debugger", "console"],
    define: {
      __DEV__: Environment.On ? "true" : "false",
      __INCREMENT__: `"${`${Environment.On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
      ...PostHogDefines
    },
    treeShaking: !Environment.On,
    entryPoints: (await import("@playform/build/Target/Function/Entry.js")).default(Current, ["Source/Configuration/*"]),
    platform: "browser",
    outbase: "Source",
    plugins: Environment.Compile ? deepmerge(Current.plugins || [], [
      {
        name: "Compile",
        setup({ onEnd }) {
          onEnd(async ({ metafile }) => {
            const _Output = metafile?.outputs;
            for (const Output in _Output) {
              if (Object.prototype.hasOwnProperty.call(
                _Output,
                Output
              )) {
                if (Output.endsWith(".js")) {
                  (await import("@playform/build/Target/Function/Exec.js")).default(
                    `Build '${Output}' 											--ESBuild Configuration/ESBuild/Target/Compile.js 											--TypeScript Configuration/tsconfig/Target/Compile.json`
                  );
                }
              }
            }
          });
        }
      }
    ]) : []
  });
  return merged;
}
__name(targetConfig, "targetConfig");
export {
  targetConfig as default
};
//# sourceMappingURL=TargetConfig.js.map
