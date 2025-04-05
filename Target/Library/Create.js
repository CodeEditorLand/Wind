var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var Create_default = /* @__PURE__ */ __name((...[[Store, [Item, _Item]], Value = null]) => {
  let Existing = get(Store);
  try {
    Existing = Get(JSON.parse(get(Store)));
  } catch (_Error) {
    console.log(_Error);
  }
  _Item(Value ?? Existing);
  return [Item, _Item];
}, "default");
const { get } = await import("store");
const { default: Get } = await import("@codeeditorland/common/Target/Function/Get.js");
export {
  Get,
  Create_default as default,
  get
};
//# sourceMappingURL=Create.js.map
