var o = async ([[t, e], r]) => (
	(await import("solid-js")).createEffect(
		(await import("solid-js")).on(
			t,
			async (a) =>
				i.set(
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
const { default: i } = await import("store");
export { i as Local, o as default };
