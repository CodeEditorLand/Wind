import { _Function as r } from "./Action/Context.js";
import "../Script/Monaco.js";
import a from "@Script/Monaco/Theme/Active4D.json";
import i from "@Script/Monaco/Theme/Amoled.json";
import { editor as o } from "monaco-editor";
o.defineTheme("Light", a),
	o.defineTheme("Dark", i),
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", ({ matches: e }) =>
			o.setTheme(e ? "Dark" : "Light"),
		);
var s = ({ children: e }) =>
	React.createElement(
		r.Provider,
		{ value: r.defaultValue },
		React.createElement("link", {
			rel: "stylesheet",
			media: "print",
			onload: (t) => {
				t.target.removeAttribute("onload"),
					t.target.removeAttribute("media");
			},
			href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap",
		}),
		e,
	);
export { s as default };
