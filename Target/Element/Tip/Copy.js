import { createComponent as o } from "solid-js/web";
import r from "../Tip.js";
const a = (t) => {
	try {
		navigator.clipboard.writeText(t.currentTarget.innerText),
			t.currentTarget.parentElement._tippy.setContent("Copied!");
	} catch (e) {
		console.log(e);
	}
};
var i = ({ children: t }) =>
	o(r, {
		Content: "Copy to clipboard.",
		onHidden: (e) => e.setContent("Copy to clipboard."),
		get children() {
			return t(() => t);
		},
	});
const { children: c } = await import("solid-js");
export { a as Fn, c as children, i as default };
