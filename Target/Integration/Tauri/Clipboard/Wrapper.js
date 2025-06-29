var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Effect } from "../../../effect";
import { IntegrationClipboardProblem } from "./Error.js";
const ReadText = Effect.tryPromise({
  try: /* @__PURE__ */ __name(() => readText(), "try"),
  catch: /* @__PURE__ */ __name((Cause) => new IntegrationClipboardProblem({ Cause, Operation: "ReadText" }), "catch")
});
const WriteText = /* @__PURE__ */ __name((Text) => Effect.tryPromise({
  try: /* @__PURE__ */ __name(() => writeText(Text), "try"),
  catch: /* @__PURE__ */ __name((Cause) => new IntegrationClipboardProblem({ Cause, Operation: "WriteText" }), "catch")
}), "WriteText");
const ReadImage = Effect.fail(
  new IntegrationClipboardProblem({
    Cause: "NotImplemented",
    Operation: "ReadImage"
  })
);
const WriteImage = /* @__PURE__ */ __name((_Image) => Effect.fail(
  new IntegrationClipboardProblem({
    Cause: "NotImplemented",
    Operation: "WriteImage"
  })
), "WriteImage");
const ReadResourceList = Effect.succeed([]);
const WriteResourceList = /* @__PURE__ */ __name((_Resources) => Effect.void, "WriteResourceList");
const HasResourceList = Effect.succeed(false);
export {
  HasResourceList,
  ReadImage,
  ReadResourceList,
  ReadText,
  WriteImage,
  WriteResourceList,
  WriteText
};
//# sourceMappingURL=Wrapper.js.map
