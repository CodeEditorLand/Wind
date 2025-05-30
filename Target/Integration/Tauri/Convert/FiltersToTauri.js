var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Option, pipe } from "../../../effect";
function Convert(MaybeFilters) {
  return pipe(
    Option.fromNullable(MaybeFilters),
    Option.filter((FiltersArray) => FiltersArray.length > 0),
    Option.map(
      (FiltersArray) => FiltersArray.map((AFilter) => ({
        name: AFilter.name,
        extensions: [...AFilter.extensions]
      }))
    )
  );
}
__name(Convert, "Convert");
export {
  Convert as default
};
//# sourceMappingURL=FiltersToTauri.js.map
