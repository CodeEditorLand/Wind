import i from "@Library/Merge";
import "@Stylesheet/Element/Anchor.scss";
import { children as y } from "solid-js";
var a = (r) => {
	const {
		Action: o,
		Type: n,
		children: p,
		Class: t,
	} = i({ children: "", Type: "button", Action: () => {}, Class: "" }, r);
	let e;
	return React.createElement(
		"button",
		{
			class: `Anchor ${typeof t == "function" ? t(e) : t}`.trim(),
			onClick: () => {
				o(e), e.blur();
			},
			ref: e,
			type: n,
		},
		y(() => p)(),
	);
};
export { a as default };
