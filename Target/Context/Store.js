import { createComponent as p } from "solid-js/web";
var d = ({ children: n, Data: c }) => (
	c?.forEach(async (e, i) => {
		const r = new URL(document.location.href),
			a = r.searchParams.get(e),
			t = (await import("../Library/Create.js")).default(
				(await import("../Library/Persist.js")).default([
					(await import("solid-js")).createSignal(""),
					e,
				]),
				a,
			);
		if (
			(a &&
				(r.searchParams.delete(e),
				window.history.pushState({}, document.title, r.href)),
			!t[0]())
		)
			switch (i) {
				case "Identifier": {
					t[1](crypto.randomUUID());
					break;
				}
				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, !0, [
							"encrypt",
							"decrypt",
						])
						.then((s) =>
							crypto.subtle
								.exportKey("jwk", s)
								.then(({ k: u }) => t[1](u ?? "")),
						);
					break;
				}
				default:
					break;
			}
		(await import("./Store/Context.js")).default.Items[0]().set(e, t);
	}),
	p(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		children: n,
	})
);
const { _Function: o } = await import("./Store/Context.js");
export { o as _Function, d as default };
