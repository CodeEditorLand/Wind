var s = async ({ children: n, Data: i }) => (
	i?.forEach(async (t, c) => {
		const r = new URL(document.location.href),
			o = r.searchParams.get(t),
			e = (await import("../Library/Create.js")).default(
				(await import("../Library/Persist.js")).default([
					(await import("solid-js")).createSignal(""),
					t,
				]),
				o,
			);
		if (
			(o &&
				(r.searchParams.delete(t),
				window.history.pushState({}, document.title, r.href)),
			!e[0]())
		)
			switch (c) {
				case "Identifier": {
					e[1](crypto.randomUUID());
					break;
				}
				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, !0, [
							"encrypt",
							"decrypt",
						])
						.then((p) =>
							crypto.subtle
								.exportKey("jwk", p)
								.then(({ k: m }) => e[1](m ?? "")),
						);
					break;
				}
				default:
					break;
			}
		(await import("./Store/Context.js")).default.Items[0]().set(t, e);
	}),
	React.createElement(a.Provider, { value: a.defaultValue }, n)
);
const { _Function: a } = await import("./Store/Context.js");
export { a as _Function, s as default };
