import n from "../Tip.js";
const o = (t) => {
	try {
		navigator.clipboard.writeText(t.currentTarget.innerText),
			t.currentTarget.parentElement._tippy.setContent("Copied!");
	} catch (e) {
		console.log(e);
	}
};
var p = async ({ children: t }) =>
	React.createElement(
		n,
		{
			Content: "Copy to clipboard.",
			onHidden: (e) => e.setContent("Copy to clipboard."),
		},
		(await import("solid-js")).children(() => t),
	);
export { o as Fn, p as default };
