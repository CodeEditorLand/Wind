var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
import {
  UriConstructor as UriFileFactory
} from "../../../Platform/VSCode/Types.js";
function Convert(SelectedPathsOption) {
  return pipe(
    SelectedPathsOption,
    Option.map(
      (SelectedValue) => Array.isArray(SelectedValue) ? SelectedValue : [SelectedValue]
    ),
    Option.filter(
      (PathsArray) => PathsArray.length > 0 && PathsArray.every(
        (PathString) => typeof PathString === "string" && PathString.length > 0
      )
    ),
    Option.map(
      (ValidPathsArray) => ValidPathsArray.map(
        (PathString) => UriFileFactory.file(PathString)
      )
    )
  );
}
__name(Convert, "Convert");
export {
  Convert as default
};
//# sourceMappingURL=OpenResultToUriArray.js.map
