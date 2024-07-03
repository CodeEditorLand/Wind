import "@Script/Tippy/Style/Theme/BorderDark.scss";
import "@Script/Tippy/Style/Theme/BorderLight.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
var f = async (n) => {
	const {
		children: o,
		Content: i,
		Class: t,
		onMount: a,
		onHidden: s,
	} = (await import("../Function/Merge.js")).default(
		{ children: "", Content: "", Class: "" },
		n,
	);
	let e;
	return (
		(await import("solid-js")).onMount(
			async () =>
				(await import("tippy.js")).default(e, {
					content: i ?? "",
					arrow: !1,
					inertia: !1,
					animation: "shift-away",
					theme: window.matchMedia("(prefers-color-scheme: dark)")
						.matches
						? "dark-border"
						: "light-border",
					hideOnClick: !1,
					onMount: (r) =>
						window
							.matchMedia("(prefers-color-scheme: dark)")
							.addEventListener("change", ({ matches: p }) =>
								r.setProps({
									theme: p ? "dark-border" : "light-border",
								}),
							),
					offset: [0, 5],
					placement: "bottom",
					interactive: !0,
					onHidden: (r) => s?.(r),
				}) && a?.(e),
		),
		React.createElement(
			"div",
			{ class: `Tip ${typeof t == "function" ? t() : t}`.trim(), ref: e },
			(await import("solid-js")).children(() => o)(),
		)
	);
};
export { f as default };
