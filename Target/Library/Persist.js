var n = ([[t, e], r]) => (
	i(
		p(
			t,
			async (a) =>
				o.set(
					r,
					JSON.stringify(
						(
							await import(
								"@codeeditorland/common/Target/Function/Put.js"
							)
						).default(a),
					),
				),
			{ defer: !1 },
		),
	),
	[r, [t, e]]
);
const { default: o } = await import("store"),
	{ createEffect: i, on: p } = await import("solid-js");
export { o as Local, i as createEffect, n as default, p as on };
