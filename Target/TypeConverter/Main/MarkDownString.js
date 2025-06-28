var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "Source/Platform/VSCode/Type.js";
import { URI } from "vs/base/common/uri.js";
const FromAPI = /* @__PURE__ */ __name((MarkdownStringInstance) => ({
  value: MarkdownStringInstance.value,
  isTrusted: MarkdownStringInstance.isTrusted,
  baseUri: MarkdownStringInstance.baseUri,
  supportHtml: MarkdownStringInstance.supportHtml
}), "FromAPI");
const ToAPI = /* @__PURE__ */ __name((MarkdownStringDTO) => {
  const Result = new MarkdownString(
    MarkdownStringDTO.value,
    typeof MarkdownStringDTO.isTrusted === "boolean" ? MarkdownStringDTO.isTrusted : MarkdownStringDTO.isTrusted
  );
  if (MarkdownStringDTO.baseUri) {
    Result.baseUri = MarkdownStringDTO.baseUri;
  }
  if (MarkdownStringDTO.supportHtml) {
    Result.supportHtml = MarkdownStringDTO.supportHtml;
  }
  return Result;
}, "ToAPI");
export {
  FromAPI,
  ToAPI
};
//# sourceMappingURL=MarkDownString.js.map
