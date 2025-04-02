var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var Persist_default = /* @__PURE__ */ __name(([[Item, _Item], Store]) => {
  createEffect(
    on(
      Item,
      async (Item2) => Local.set(
        Store,
        JSON.stringify(
          (await import("@codeeditorland/common/Target/Function/Put.js")).default(Item2)
        )
      ),
      {
        defer: false
      }
    )
  );
  return [Store, [Item, _Item]];
}, "default");
const { default: Local } = await import("store");
const { createEffect, on } = await import("solid-js");
export {
  Local,
  createEffect,
  Persist_default as default,
  on
};
//# sourceMappingURL=Persist.js.map
