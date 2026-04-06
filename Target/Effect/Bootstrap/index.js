var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect } from "effect";
import { BootstrapLive } from "./Implementation/BootstrapImplementation.js";
import { BootstrapTag } from "./Tag/BootstrapTag.js";
import { BootstrapTag as BootstrapTag2 } from "./Tag/BootstrapTag.js";
import {
  stage0_Environment,
  stage1_Preload,
  stage2_Configuration,
  stage3_Services,
  stage4_Preparation,
  stage5_Initialization,
  stage6_HealthCheck
} from "./Implementation/BootstrapStage.js";
import { BootstrapLive as BootstrapLive2 } from "./Implementation/BootstrapImplementation.js";
import { BootstrapMock, makeMockBootstrap } from "./Layer/BootstrapMock.js";
const runBootstrap = /* @__PURE__ */ __name((options) => Effect.gen(function* () {
  const bootstrap = yield* BootstrapTag;
  return yield* bootstrap.run(options);
}).pipe(Effect.provide(BootstrapLive)), "runBootstrap");
export {
  BootstrapLive2 as BootstrapLive,
  BootstrapMock,
  BootstrapTag2 as BootstrapTag,
  makeMockBootstrap,
  runBootstrap,
  stage0_Environment,
  stage1_Preload,
  stage2_Configuration,
  stage3_Services,
  stage4_Preparation,
  stage5_Initialization,
  stage6_HealthCheck
};
//# sourceMappingURL=index.js.map
