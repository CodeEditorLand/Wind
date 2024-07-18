import { template as i } from "solid-js/web";
import { createComponent as n } from "solid-js/web";
var s = i(
	'<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">',
);
self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => {},
	getWorker: async (e, t) => {
		switch (t) {
			case "css":
				return new (
					await import(
						"monaco-editor/esm/vs/language/css/css.worker.js?worker"
					)
				).default();
			case "html":
				return new (
					await import(
						"monaco-editor/esm/vs/language/html/html.worker.js?worker"
					)
				).default();
			case "typescript":
				return new (
					await import(
						"monaco-editor/esm/vs/language/typescript/ts.worker.js?worker"
					)
				).default();
			default:
				return new (
					await import(
						"monaco-editor/esm/vs/editor/editor.worker.js?worker"
					)
				).default();
		}
	},
};
var m = ({ children: e }) =>
	n(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		get children() {
			return [
				(() => {
					var t = s();
					return (
						t.addEventListener("load", (a) => {
							a.target.removeAttribute("onload"),
								a.target.removeAttribute("media");
						}),
						t
					);
				})(),
				e,
			];
		},
	});
const { editor: r, languages: p } = await import("monaco-editor");
p.typescript.typescriptDefaults.setEagerModelSync(!0),
	r.defineTheme(
		"Light",
		(await import("../Script/Monaco/Theme/Active4D.json")).default,
	),
	r.defineTheme(
		"Dark",
		(await import("../Script/Monaco/Theme/Amoled.json")).default,
	),
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", ({ matches: e }) =>
			r.setTheme(e ? "Dark" : "Light"),
		);
const { _Function: o } = await import("./Action/Context.js");
export { r as Monaco, o as _Function, m as default, p as languages };
