import type { JSX } from "solid-js";

import { _Function } from "@Context/Action/Context";
import "@Script/Monaco";
import LightTheme from "@Script/Monaco/Theme/Active4D.json";
import DarkTheme from "@Script/Monaco/Theme/Amoled.json";

import { editor as Monaco } from "monaco-editor";

Monaco.defineTheme("Light", LightTheme as Monaco.IStandaloneThemeData);
Monaco.defineTheme("Dark", DarkTheme as Monaco.IStandaloneThemeData);

window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", ({ matches }) =>
		Monaco.setTheme(matches ? "Dark" : "Light"),
	);

export default ({ children }: { children?: JSX.Element }) => (
	<_Function.Provider value={_Function.defaultValue}>
		<link
			rel="stylesheet"
			media="print"
			onload={(Event) => {
				Event.target.removeAttribute("onload");
				Event.target.removeAttribute("media");
			}}
			href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap"
		/>
		{children}
	</_Function.Provider>
);
