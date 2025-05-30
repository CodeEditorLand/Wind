var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
import {
  Scheme,
  UriConstructor
} from "../../../Platform/VSCode/Types.js";
function Convert(MaybeUri) {
  return pipe(
    Option.fromNullable(MaybeUri),
    Option.filter((CheckedUri) => CheckedUri.scheme === Scheme.file),
    Option.map((FileUri) => FileUri.fsPath)
  );
}
__name(Convert, "Convert");
export {
  Convert as default
};
//# sourceMappingURL=UriToPathString.js.map
