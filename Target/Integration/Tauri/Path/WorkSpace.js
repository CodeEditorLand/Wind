var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { Effect } from "../../../effect";
import { URI } from "../../../Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";
const ResolveWorkSpacePath = /* @__PURE__ */ __name(() => Effect.tryPromise({
  // In this context, we treat the "workspace" as the app's config dir.
  try: /* @__PURE__ */ __name(async () => {
    const WorkspaceConfigPath = await resolve(
      BaseDirectory.AppConfig.toString()
    );
    return URI.file(WorkspaceConfigPath);
  }, "try"),
  catch: /* @__PURE__ */ __name((Cause) => new IntegrationPathProblem({ Cause }), "catch")
}), "ResolveWorkSpacePath");
export {
  ResolveWorkSpacePath
};
//# sourceMappingURL=WorkSpace.js.map
