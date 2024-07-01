import "@Stylesheet/Element/Button.scss";

export type Fn = HTMLButtonElement | ((Button: HTMLButtonElement) => void);

export interface Property {
	// biome-ignore lint/suspicious/noExplicitAny:
	children?: any;

	Type?: "submit" | "reset" | "button";

	Action?: (Fn?: Fn) => void;

	Class?: string | ((Fn?: Fn) => string);

	Label?: string;

	Fn?: Fn;
}

export type Concrete<Type> = {
	[Key in keyof Type]-?: Type[Key];
};

export default async (Property: Property) => {
	const { Action, Type, children, Class, Label } = (
		await import("@Function/Merge.js")
	).default(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
			Label: "",
		} satisfies Property,
		Property,
	) as Concrete<Property> satisfies Concrete<Property>;

	return (
		<button
			class={`Button ${
				typeof Class === "function" ? Class(Property.Fn) : Class
			}`.trim()}
			onClick={() => {
				Action(Property.Fn);
				Property.Fn?.blur();
			}}
			ref={Property.Fn}
			type={Type}
			aria-label={Label}>
			{(await import("solid-js")).children(() => children)()}
		</button>
	);
};
