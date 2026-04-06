import { Layer as r } from "effect";

import { MockClipboardService as e } from "./Implementation/MockClipboard.js";
import { ClipboardServiceTag as o } from "./Tag/ClipboardServiceTag.js";

const i = r.succeed(o, e);
var t = i;
export { i as MockClipboardServiceLayer, t as default };
