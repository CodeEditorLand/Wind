var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer } from "effect";
const LiveClipboardService = {
  readText: /* @__PURE__ */ __name(() => Effect.tryPromise({
    try: /* @__PURE__ */ __name(async () => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw {
          _tag: "ClipboardNotAvailable",
          reason: "Clipboard API not available in this environment"
        };
      }
      return await navigator.clipboard.readText();
    }, "try"),
    catch: /* @__PURE__ */ __name((error) => ({
      _tag: "ClipboardReadError",
      error
    }), "catch")
  }), "readText"),
  writeText: /* @__PURE__ */ __name((text) => Effect.tryPromise({
    try: /* @__PURE__ */ __name(async () => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw {
          _tag: "ClipboardNotAvailable",
          reason: "Clipboard API not available in this environment"
        };
      }
      await navigator.clipboard.writeText(text);
    }, "try"),
    catch: /* @__PURE__ */ __name((error) => ({
      _tag: "ClipboardWriteError",
      error
    }), "catch")
  }), "writeText"),
  // Placeholder implementations for remaining methods
  readHTML: /* @__PURE__ */ __name(() => Effect.fail({
    _tag: "ClipboardFormatNotSupported",
    format: "HTML"
  }), "readHTML"),
  writeHTML: /* @__PURE__ */ __name(() => Effect.fail({
    _tag: "ClipboardFormatNotSupported",
    format: "HTML"
  }), "writeHTML"),
  readImage: /* @__PURE__ */ __name(() => Effect.fail({
    _tag: "ClipboardFormatNotSupported",
    format: "Image"
  }), "readImage"),
  writeImage: /* @__PURE__ */ __name(() => Effect.fail({
    _tag: "ClipboardFormatNotSupported",
    format: "Image"
  }), "writeImage"),
  hasText: /* @__PURE__ */ __name(() => Effect.succeed(false), "hasText"),
  clear: /* @__PURE__ */ __name(() => Effect.void, "clear")
};
class ClipboardServiceTag extends Context.Tag("Application/ClipboardService")() {
  static {
    __name(this, "ClipboardServiceTag");
  }
}
const LiveClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  LiveClipboardService
);
const MockClipboardService = {
  readText: /* @__PURE__ */ __name(() => Effect.succeed("mock clipboard text"), "readText"),
  writeText: /* @__PURE__ */ __name((text) => Effect.void, "writeText"),
  readHTML: /* @__PURE__ */ __name(() => Effect.succeed(""), "readHTML"),
  writeHTML: /* @__PURE__ */ __name(() => Effect.void, "writeHTML"),
  readImage: /* @__PURE__ */ __name(() => Effect.succeed(new Blob()), "readImage"),
  writeImage: /* @__PURE__ */ __name(() => Effect.void, "writeImage"),
  hasText: /* @__PURE__ */ __name(() => Effect.succeed(true), "hasText"),
  clear: /* @__PURE__ */ __name(() => Effect.void, "clear")
};
const MockClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  MockClipboardService
);
export {
  ClipboardServiceTag,
  LiveClipboardServiceLayer,
  MockClipboardServiceLayer
};
//# sourceMappingURL=Clipboard.js.map
