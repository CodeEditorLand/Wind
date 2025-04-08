var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createComponent as _$createComponent } from "solid-js/web";
var Store_default = /* @__PURE__ */ __name(({
  children,
  Data
}) => {
  Data?.forEach(async (Name, Kind) => {
    const Current = new URL(document.location.href);
    const Search = Current.searchParams.get(Name);
    const Item = (await import("../Library/Create.js")).default((await import("../Library/Persist.js")).default([(await import("solid-js")).createSignal(""), Name]), Search);
    if (Search) {
      Current.searchParams.delete(Name);
      window.history.pushState({}, document.title, Current.href);
    }
    if (!Item[0]()) {
      switch (Kind) {
        case "Identifier": {
          Item[1](crypto.randomUUID());
          break;
        }
        case "Key": {
          crypto.subtle.generateKey({
            name: "AES-GCM",
            length: 256
          }, true, ["encrypt", "decrypt"]).then((Key) => crypto.subtle.exportKey("jwk", Key).then(({
            k
          }) => Item[1](k ?? "")));
          break;
        }
        default: {
          break;
        }
      }
    }
    (await import("./Store/Context.js")).default.Items[0]().set(Name, Item);
  });
  return _$createComponent(_Function.Provider, {
    get value() {
      return _Function.defaultValue;
    },
    children
  });
}, "default");
const {
  _Function
} = await import("./Store/Context.js");
export {
  _Function,
  Store_default as default
};
//# sourceMappingURL=Store.js.map
