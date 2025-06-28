var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const ToDTO = /* @__PURE__ */ __name((Items, Options) => ({
  Items: Items.map((Item) => ({
    label: Item.label,
    description: Item.description,
    detail: Item.detail,
    picked: Item.picked,
    alwaysShow: Item.alwaysShow
  })),
  Options: {
    canPickMany: Options.canPickMany,
    placeHolder: Options.placeHolder,
    matchOnDescription: Options.matchOnDescription,
    matchOnDetail: Options.matchOnDetail,
    title: Options.title
  }
}), "ToDTO");
const ToDTOFromInput = /* @__PURE__ */ __name((Options) => ({
  placeHolder: Options.placeHolder,
  prompt: Options.prompt,
  value: Options.value,
  password: Options.password,
  title: Options.title
}), "ToDTOFromInput");
export {
  ToDTO,
  ToDTOFromInput
};
//# sourceMappingURL=QuickInput.js.map
