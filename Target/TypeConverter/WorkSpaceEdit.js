var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  TextEdit as ExtHostTextEdit,
  WorkspaceEdit as ExtHostWorkspaceEdit
} from "../Platform/VSCode/Type.js";
import {
  FromAPI as TextEditFromAPI,
  ToAPI as TextEditToAPI
} from "./Main/TextEdit.js";
import { FromAPI as UriFromAPI, ToAPI as UriToAPI } from "./Main/URI.js";
const FromAPI = /* @__PURE__ */ __name((Edit, VersionProvider) => {
  const Result = { edits: [] };
  for (const [URI, URIEditArray] of Edit.entries()) {
    const Resource = UriFromAPI(URI);
    const VersionId = VersionProvider?.GetTextDocumentVersion(URI);
    for (const SingleEdit of URIEditArray) {
      if (SingleEdit instanceof ExtHostTextEdit) {
        const TextEditDTO = {
          _type: "text",
          resource: Resource,
          edit: TextEditFromAPI(SingleEdit)
        };
        if (VersionId !== void 0) {
          TextEditDTO.versionId = VersionId;
        }
        Result.edits.push(TextEditDTO);
      }
    }
  }
  return Result;
}, "FromAPI");
const ToAPI = /* @__PURE__ */ __name((DTO) => {
  const Result = new ExtHostWorkspaceEdit();
  for (const Edit of DTO.edits) {
    if (Edit._type === "text") {
      const URI = UriToAPI(Edit.resource);
      const TextEditArray = [TextEditToAPI(Edit.edit)];
      Result.set(URI, TextEditArray);
    } else if (Edit._type === "file") {
      if (Edit.oldResource && Edit.newResource) {
        Result.renameFile(
          UriToAPI(Edit.oldResource),
          UriToAPI(Edit.newResource),
          Edit.options
        );
      } else if (Edit.newResource) {
        Result.createFile(UriToAPI(Edit.newResource), Edit.options);
      } else if (Edit.oldResource) {
        Result.deleteFile(UriToAPI(Edit.oldResource), Edit.options);
      }
    }
  }
  return Result;
}, "ToAPI");
export {
  FromAPI,
  ToAPI
};
//# sourceMappingURL=WorkSpaceEdit.js.map
