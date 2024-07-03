var O = ({ Type: r } = { Type: "HTML" }) => {
	const [n, { Form: d, Field: m }] = L(),
		i = crypto.randomUUID();
	p(
		f(
			o.Editors[0],
			(e) => {
				D(n, "Content", e.get(i)?.Content ?? "", {
					shouldFocus: !1,
					shouldTouched: !1,
				}),
					h(n);
			},
			{ defer: !1 },
		),
	);
	const s = k(C(r));
	p(
		f(c.Messages[0], (e) => e?.get("Type") && s[1](e?.get("Type")), {
			defer: !1,
		}),
	);
	let u, t;
	return (
		o.Editors[0]().set(i, {
			Type: r,
			Hidden: o.Editors[0]().size > 0,
			Content: s[0](),
		}),
		H(() => {
			u instanceof HTMLElement &&
				((t = w.create(u, {
					value: s[0](),
					language: r.toLowerCase(),
					automaticLayout: !0,
					lineNumbers: "off",
					"semanticHighlighting.enabled": "configuredByTheme",
					autoClosingBrackets: "always",
					autoIndent: "full",
					tabSize: 4,
					detectIndentation: !1,
					useTabStops: !0,
					minimap: { enabled: !1 },
					scrollbar: {
						useShadows: !0,
						horizontal: "hidden",
						verticalScrollbarSize: 10,
						verticalSliderSize: 4,
						alwaysConsumeMouseWheel: !1,
					},
					folding: !1,
					theme: window.matchMedia("(prefers-color-scheme: dark)")
						.matches
						? "Dark"
						: "Light",
					wrappingStrategy: "advanced",
					wordWrap: "on",
					bracketPairColorization: {
						enabled: !0,
						independentColorPoolPerBracketType: !0,
					},
					padding: { top: 12, bottom: 12 },
					fixedOverflowWidgets: !0,
					tabCompletion: "on",
					acceptSuggestionOnEnter: "on",
					cursorWidth: 5,
					roundedSelection: !0,
					matchBrackets: "always",
					autoSurround: "languageDefined",
					screenReaderAnnounceInlineSuggestion: !1,
					renderFinalNewline: "on",
					selectOnLineNumbers: !1,
					formatOnType: !0,
					formatOnPaste: !0,
					fontFamily: "'Source Code Pro'",
					fontWeight: "400",
					fontLigatures: !0,
					links: !1,
					fontSize: 16,
				})),
				t.getModel()?.setEOL(w.EndOfLineSequence.LF),
				t.onKeyDown((e) => {
					e.ctrlKey &&
						e.code === "KeyS" &&
						(e.preventDefault(), h(n), n.element?.submit());
				}),
				t.getModel()?.onDidChangeContent(() => {
					o.Editors[1](
						S(
							o.Editors[0](),
							new Map([
								[
									i,
									{
										Content: t.getModel()?.getValue() ?? "",
										Hidden:
											o.Editors[0]()?.get(i)?.Hidden ??
											!0,
										Type: r,
									},
								],
							]),
						),
					);
				}),
				t.onDidChangeModelLanguageConfiguration(() =>
					t.getAction("editor.action.formatDocument")?.run(),
				),
				t.onDidLayoutChange(() =>
					t.getAction("editor.action.formatDocument")?.run(),
				),
				window.addEventListener("load", () =>
					t.getAction("editor.action.formatDocument")?.run(),
				),
				setTimeout(
					() => t.getAction("editor.action.formatDocument")?.run(),
					1e3,
				),
				p(f(s[0], (e) => t.getModel()?.setValue(e), { defer: !1 })),
				c.Socket[0]()?.send(
					JSON.stringify({
						Key: l.Items[0]()?.get("Key")?.[0](),
						Identifier: l.Items[0]()?.get("Identifier")?.[0](),
						From: "Content",
						View: r,
					}),
				));
		}),
		React.createElement(
			"div",
			{
				class:
					!o.Editors[0]()?.get(i)?.Hidden && T.Data[0]()?.get("Name")
						? ""
						: "hidden",
			},
			React.createElement(
				"p",
				null,
				"Edit your",
				" ",
				React.createElement(
					A,
					{ each: Array.from(o.Editors[0]().entries()) },
					(e, a) =>
						React.createElement(
							React.Fragment,
							null,
							React.createElement(
								b,
								{
									Action: () => {
										o.Editors[0]().forEach((g, y) => {
											(g.Hidden = e[0] !== y),
												o.Editors[1](
													S(
														o.Editors[0](),
														new Map([[y, g]]),
													),
												);
										}),
											setTimeout(() => {
												t.setScrollPosition({
													scrollTop: -50,
												});
											}, 1e3);
									},
								},
								e[1].Type,
							),
							a() === o.Editors[0]().size - 1 ? "" : " / ",
						),
				),
				" ",
				"here:",
			),
			React.createElement("br", null),
			React.createElement(
				d,
				{ method: "post", onSubmit: E },
				React.createElement(
					m,
					{
						name: "Content",
						validate: [I(`Please enter some ${r}.`)],
					},
					(e, a) =>
						React.createElement(
							"div",
							{ class: "w-full" },
							React.createElement(
								"div",
								{ class: "Editor" },
								React.createElement("code", {
									ref: u,
									class: "Monaco",
								}),
								e.error &&
									React.createElement(
										React.Fragment,
										null,
										React.createElement(
											"div",
											{
												class: "Error",
												onClick: () => {
													F(n, "Content"), t.focus();
												},
											},
											React.createElement(
												"span",
												null,
												"\xA0\xA0\xA0",
												e.error,
											),
										),
									),
								React.createElement("input", {
									...a,
									value:
										o.Editors[0]()?.get(i)?.Content ?? "",
									type: "hidden",
									required: !0,
								}),
							),
						),
				),
				React.createElement(m, { name: "Field" }, (e, a) =>
					React.createElement("input", {
						type: "hidden",
						...a,
						value: r,
					}),
				),
			),
		)
	);
};
const C = (r) => {
		switch (r) {
			case "CSS":
				return M;
			case "HTML":
				return x;
			case "TypeScript":
				return v;
			default:
				return "";
		}
	},
	E = ({ Content: r, Field: n }, d) => {
		d &&
			(d.preventDefault(),
			c.Socket[0]()?.send(
				JSON.stringify({
					Key: l.Items[0]()?.get("Key")?.[0](),
					Identifier: l.Items[0]()?.get("Identifier")?.[0](),
					To: n,
					Input: r,
				}),
			));
	},
	{ default: o } = await import("../Context/Action/Context.js"),
	{ default: c } = await import("../Context/Connection/Context.js"),
	{ default: T } = await import("../Context/Session/Context.js"),
	{ default: l } = await import("../Context/Store/Context.js"),
	{ default: b } = await import("./Anchor.js"),
	{ default: z } = await import("./Button.js"),
	{ default: K, Fn: P } = await import("./Tip/Copy.js"),
	{ default: S } = await import("@Library/Merge"),
	{ default: N } = await import("@Library/Wrap"),
	{ default: M } = await import("@Option/Edit/Theme/Default/CSS"),
	{ default: x } = await import("@Option/Edit/Theme/Default/HTML"),
	{ default: v } = await import("@Option/Edit/Theme/Default/TypeScript");
import {
	clearError as F,
	createForm as L,
	required as I,
	setValue as D,
	validate as h,
} from "@modular-forms/solid";
import { editor as w } from "monaco-editor";
import { onMount as H } from "solid-js";
import {
	For as A,
	createEffect as p,
	createSignal as k,
	on as f,
} from "solid-js";
import "@Stylesheet/Element/Action.scss";
import "@Stylesheet/Element/Editor.scss";
export {
	o as Action,
	b as Anchor,
	z as Button,
	M as CSS,
	c as Connection,
	P as Copy,
	x as HTML,
	S as Merge,
	C as Return,
	T as Session,
	l as Store,
	K as Tip,
	v as TypeScript,
	E as Update,
	N as Wrap,
	O as default,
};
