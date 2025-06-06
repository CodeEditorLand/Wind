import { Context } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

export type Interface = IClipboardService;

const ClipboardServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ClipboardService",
);

export default ClipboardServiceTag;

import { Context } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

export type Interface = IClipboardService;

const ClipboardServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ClipboardService",
);

export default ClipboardServiceTag;
