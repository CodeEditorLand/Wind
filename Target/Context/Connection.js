import { createComponent as o } from "solid-js/web";
var n = ({ children: e }) =>
	o(t.Provider, {
		get value() {
			return t.defaultValue;
		},
		children: e,
	});
const { createEffect: a, on: c } = await import("solid-js"),
	{ default: i, _Function: t } = await import("./Connection/Context.js");
export {
	i as Connection,
	t as _Function,
	a as createEffect,
	n as default,
	c as on,
};
