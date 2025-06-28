var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "vs/base/common/uri.js";
const FromDTO = /* @__PURE__ */ __name((DTO) => ({
  id: String(DTO.Handle),
  label: DTO.Label,
  rootUri: DTO.RootUri ? URI.parse(DTO.RootUri) : void 0
}), "FromDTO");
export {
  FromDTO
};
//# sourceMappingURL=Provider.js.map
