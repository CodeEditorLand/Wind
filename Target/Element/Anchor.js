import { template as n } from "solid-js/web";
import { delegateEvents as f } from "solid-js/web";
import { className as p } from "solid-js/web";
import { effect as l } from "solid-js/web";
import { insert as c } from "solid-js/web";
import { setAttribute as $ } from "solid-js/web";
import { use as u } from "solid-js/web";
var _ = n("<button>");
import d from "../Function/Merge.js";
import "../Stylesheet/Element/Anchor.scss";
import { children as b } from "solid-js";
var w = (m) => {
	const {
		Action: s,
		Type: i,
		children: a,
		Class: r,
	} = d({ children: "", Type: "button", Action: () => {}, Class: "" }, m);
	let e;
	return (() => {
		var t = _(),
			o = e;
		return (
			typeof o == "function" ? u(o, t) : (e = t),
			(t.$$click = () => {
				s(e), e.blur();
			}),
			$(t, "type", i),
			c(t, () => b(() => a)()),
			l(() => p(t, `Anchor ${typeof r == "function" ? r(e) : r}`.trim())),
			t
		);
	})();
};
f(["click"]);
export { w as default };
