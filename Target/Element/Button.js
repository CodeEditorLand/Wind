import { template as n } from "solid-js/web";
import { delegateEvents as m } from "solid-js/web";
import { className as c } from "solid-js/web";
import { effect as p } from "solid-js/web";
import { insert as f } from "solid-js/web";
import { setAttribute as i } from "solid-js/web";
var u = n("<button>");
import "../Stylesheet/Element/Button.scss";
var x = (e) => {
	const {
		Action: o,
		Type: s,
		children: r,
		Class: a,
		Label: l,
	} = $(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
			Label: "",
		},
		e,
	);
	return (() => {
		var t = u();
		return (
			(t.$$click = () => {
				o(e.Fn), e.Fn?.blur();
			}),
			i(t, "type", s),
			i(t, "aria-label", l),
			f(t, () => r(() => r)()),
			p(() =>
				c(t, `Button ${typeof a == "function" ? a(e.Fn) : a}`.trim()),
			),
			t
		);
	})();
};
const { children: F } = await import("solid-js"),
	{ default: $ } = await import("../Function/Merge.js");
m(["click"]);
export { $ as Merge, F as children, x as default };
