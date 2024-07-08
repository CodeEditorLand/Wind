import type { Concrete } from "@Element/Button";

import type { Instance } from "tippy.js";

import "@Stylesheet/Element/Tippy/Dark.scss";
import "@Stylesheet/Element/Tippy/Light.scss";

import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";

export type Tip = HTMLDivElement & {
	_tippy: Instance;
};

export type Property = {
	// biome-ignore lint/suspicious/noExplicitAny:
	children?: any;

	Content?: string;

	onMount?: (Tip: Tip) => void;

	onHidden?: (Instance: Instance) => void;

	Class?: string | (() => string);
};

export default async (Property: Property) => {
	const { children, Content, Class, onMount, onHidden } = (
		await import("@Function/Merge.js")
	).default(
		{
			children: "",
			Content: "",
			Class: "",
		} satisfies Property,
		Property,
	) as Concrete<Property> satisfies Concrete<Property>;

	let Fn!: Tip;

	(await import("solid-js")).onMount(
		async () =>
			(await import("tippy.js")).default(Fn, {
				content: Content ?? "",
				arrow: false,
				inertia: false,
				animation: "shift-away",
				theme: window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark-border"
					: "light-border",
				hideOnClick: false,
				onMount: (instance) =>
					window
						.matchMedia("(prefers-color-scheme: dark)")
						.addEventListener("change", ({ matches }) =>
							instance.setProps({
								theme: matches ? "dark-border" : "light-border",
							}),
						),
				offset: [0, 5],
				placement: "bottom",
				interactive: true,
				onHidden: (Instance) => onHidden?.(Instance),
			}) && onMount?.(Fn),
	);

	return (
		<div
			class={`Tip ${
				typeof Class === "function" ? Class() : Class
			}`.trim()}
			ref={Fn}>
			{(await import("solid-js")).children(() => children)()}
		</div>
	);
};
