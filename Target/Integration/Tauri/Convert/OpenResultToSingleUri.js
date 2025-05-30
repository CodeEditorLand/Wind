var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
import {
  UriConstructor as UriFileFactory
} from "../../../Platform/VSCode/Types.js";
function Convert(SelectedPathOption) {
  return pipe(
    SelectedPathOption,
    Option.filter(
      (SelectedValue) => typeof SelectedValue === "string" && SelectedValue.length > 0
    ),
    Option.map((PathString) => UriFileFactory.file(PathString))
  );
}
__name(Convert, "Convert");
export {
  Convert as default
};
//# sourceMappingURL=OpenResultToSingleUri.js.map
