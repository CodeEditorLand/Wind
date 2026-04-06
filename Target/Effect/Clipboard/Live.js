import { Layer as r } from "effect";

import { LiveBrowserClipboardService as o } from "./Implementation/BrowserClipboard.js";
import { ClipboardServiceTag as e } from "./Tag/ClipboardServiceTag.js";

const i = r.succeed(e, o);
var c = i;
export { i as LiveClipboardServiceLayer, c as default };
