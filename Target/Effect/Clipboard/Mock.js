import { Layer } from "effect";
import { MockClipboardService } from "./Implementation/MockClipboard.js";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";
const MockClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  MockClipboardService
);
var Mock_default = MockClipboardServiceLayer;
export {
  MockClipboardServiceLayer,
  Mock_default as default
};
//# sourceMappingURL=Mock.js.map
