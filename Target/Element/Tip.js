import { template as p } from "solid-js/web";
import { className as c } from "solid-js/web";
import { effect as f } from "solid-js/web";
import { insert as d } from "solid-js/web";
import { use as l } from "solid-js/web";
var h = p("<div>");
import "../Stylesheet/Element/Tippy/Dark.scss";
import "../Stylesheet/Element/Tippy/Light.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
var E = (n) => {
	const {
		children: a,
		Content: i,
		Class: o,
		onMount: s,
		onHidden: m,
	} = u({ children: "", Content: "", Class: "" }, n);
	let t;
	return (
		$(
			() => (
				w(t, {
					content: i ?? "",
					arrow: !1,
					inertia: !1,
					animation: "shift-away",
					theme: window.matchMedia("(prefers-color-scheme: dark)")
						.matches
						? "dark-border"
						: "light-border",
					hideOnClick: !1,
					onMount: (e) =>
						window
							.matchMedia("(prefers-color-scheme: dark)")
							.addEventListener("change", ({ matches: r }) =>
								e.setProps({
									theme: r ? "dark-border" : "light-border",
								}),
							),
					offset: [0, 5],
					placement: "bottom",
					interactive: !0,
					onHidden: (e) => m?.(e),
				}),
				s?.(t)
			),
		),
		(() => {
			var e = h(),
				r = t;
			return (
				typeof r == "function" ? l(r, e) : (t = e),
				d(e, () => a(() => a)()),
				f(() => c(e, `Tip ${typeof o == "function" ? o() : o}`.trim())),
				e
			);
		})()
	);
};
const { default: u } = await import("../Function/Merge.js"),
	{ default: w } = await import("tippy.js"),
	{
		createEffect: H,
		on: N,
		children: T,
		onMount: $,
	} = await import("solid-js");
export {
	u as Merge,
	$ as SonMount,
	w as Tippy,
	T as children,
	H as createEffect,
	E as default,
	N as on,
};
