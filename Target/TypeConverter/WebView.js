var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FromAPI as ViewColumnFromAPI } from "./Main/ViewColumn.js";
const ConvertContentOptionsToDTO = /* @__PURE__ */ __name((Extension, Options) => {
  return {
    enableCommandUris: Options.enableCommandUris,
    enableScripts: Options.enableScripts,
    enableForms: Options.enableForms,
    localResourceRoots: Options.localResourceRoots ?? [
      Extension.extensionLocation
    ],
    portMapping: Options.portMapping
  };
}, "ConvertContentOptionsToDTO");
const ConvertPanelOptionsToDTO = /* @__PURE__ */ __name((Options) => {
  const DTO = {};
  if (Options.enableFindWidget !== void 0) {
    DTO.enableFindWidget = Options.enableFindWidget;
  }
  if (Options.retainContextWhenHidden !== void 0) {
    DTO.retainContextWhenHidden = Options.retainContextWhenHidden;
  }
  return DTO;
}, "ConvertPanelOptionsToDTO");
const ConvertShowOptionsToDTO = /* @__PURE__ */ __name((ViewColumn, PreserveFocus) => {
  const DTO = {
    preserveFocus: PreserveFocus
  };
  const ViewColumnValue = ViewColumnFromAPI(ViewColumn);
  if (ViewColumnValue !== void 0) {
    DTO.viewColumn = ViewColumnValue;
  }
  return DTO;
}, "ConvertShowOptionsToDTO");
export {
  ConvertContentOptionsToDTO,
  ConvertPanelOptionsToDTO,
  ConvertShowOptionsToDTO
};
//# sourceMappingURL=WebView.js.map
