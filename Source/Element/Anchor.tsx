import Merge from "@Function/Merge.js";

import "@Stylesheet/Element/Anchor.scss";

import { children as Show, createSignal } from "solid-js";

export type Type = HTMLButtonElement | undefined;

export interface Property {
	// biome-ignore lint/suspicious/noExplicitAny:
	children?: any;

	Type?: "submit" | "reset" | "button";

	Action?: (Fn: Type) => void;

	Class?: string | ((Fn: Type) => string);
}

export type Concrete<Type> = {
	[Key in keyof Type]-?: Type[Key];
};

export default (Property: Property) => {
	const { Action, Type, children, Class } = Merge(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
		} satisfies Property,
		Property,
	) as Concrete<Property> satisfies Concrete<Property>;

	const [Fn, _Fn] = createSignal<Type>();

	return (
		<button
			class={`Anchor ${
				typeof Class === "function" ? Class(Fn()) : Class
			}`.trim()}
			onClick={() => {
				Action(Fn());
				Fn()?.blur();
			}}
			ref={_Fn}
			type={Type}>
			{Show(() => children)()}
		</button>
	);
};
