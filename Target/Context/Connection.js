var n = async ({ children: i }) => {
	const { createEffect: a, on: s } = await import("solid-js"),
		{ default: e, _Function: r } = await import("./Connection/Context.js");
	return (
		a(s(e.State, (t) => e.Status[1](e.States[t]), { defer: !1 })),
		a(
			s(
				e.Socket[0],
				(t) =>
					t?.addEventListener("message", async (o) =>
						e.Messages[1](
							(await import("../Function/Merge.js")).default(
								e.Messages[0](),
								await (
									await import(
										"@codeeditorland/common/Target/Function/Get.js"
									)
								).default(JSON.parse(o.data)),
							),
						),
					),
				{ defer: !1 },
			),
		),
		React.createElement(r.Provider, { value: r.defaultValue }, i)
	);
};
export { n as default };
