var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { Effect } from "../../../effect";
import { URI } from "../../../Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";
const ResolveFinalDefaultPath = /* @__PURE__ */ __name(() => Effect.tryPromise({
  try: /* @__PURE__ */ __name(async () => {
    const AppConfigPath = await resolve(
      BaseDirectory.AppConfig.toString()
    );
    return URI.file(AppConfigPath);
  }, "try"),
  catch: /* @__PURE__ */ __name((Cause) => new IntegrationPathProblem({ Cause }), "catch")
}), "ResolveFinalDefaultPath");
export {
  ResolveFinalDefaultPath
};
//# sourceMappingURL=Default.js.map
