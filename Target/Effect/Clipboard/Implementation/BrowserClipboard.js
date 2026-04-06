import { Effect as r } from "effect";

import {
	CreateFormatNotSupportedError as e,
	CreateWriteError as l,
	CreateReadError as o,
	CreateNotAvailableError as t,
} from "./ClipboardHelper.js";

const n = {
	readText: () =>
		r.tryPromise({
			try: async () => {
				if (typeof navigator > "u" || !navigator.clipboard)
					throw t("Clipboard API not available in this environment");
				return await navigator.clipboard.readText();
			},
			catch: (a) => o(a),
		}),
	writeText: (a) =>
		r.tryPromise({
			try: async () => {
				if (typeof navigator > "u" || !navigator.clipboard)
					throw t("Clipboard API not available in this environment");
				await navigator.clipboard.writeText(a);
			},
			catch: (i) => l(i),
		}),
	readHTML: () => r.fail(e("HTML")),
	writeHTML: () => r.fail(e("HTML")),
	readImage: () => r.fail(e("Image")),
	writeImage: () => r.fail(e("Image")),
	hasText: () => r.succeed(!1),
	clear: () => r.void,
};
var c = n;
export { n as LiveBrowserClipboardService, c as default };
