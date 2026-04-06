import { LiveBrowserClipboardService as m } from "./Clipboard/Implementation/BrowserClipboard.js";
import {
	CreateFormatNotSupportedError as E,
	CreateReadError as f,
	CreateSizeExceededError as k,
	CreatePermissionDeniedError as n,
	CreateNotAvailableError as S,
	CreateWriteError as y,
} from "./Clipboard/Implementation/ClipboardHelper.js";
import { MockClipboardService as s } from "./Clipboard/Implementation/MockClipboard.js";
import { LiveClipboardServiceLayer as r } from "./Clipboard/Live.js";
import { MockClipboardServiceLayer as e } from "./Clipboard/Mock.js";
import {
	Clipboard as b,
	ClipboardServiceTag as l,
} from "./Clipboard/Tag/ClipboardServiceTag.js";

const a = r,
	p = e,
	t = r,
	C = e;
export {
	b as Clipboard,
	l as ClipboardServiceTag,
	E as CreateFormatNotSupportedError,
	S as CreateNotAvailableError,
	n as CreatePermissionDeniedError,
	f as CreateReadError,
	k as CreateSizeExceededError,
	y as CreateWriteError,
	m as LiveBrowserClipboardService,
	t as LiveClipboard,
	a as LiveClipboardServiceLayer,
	r as LiveLayer,
	C as MockClipboard,
	s as MockClipboardService,
	p as MockClipboardServiceLayer,
	e as MockLayer,
};
