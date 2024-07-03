import t from "./Connection/Context.js";
import n, { _Function as o } from "./Session/Context.js";
import r from "./Store/Context.js";
import { createEffect as m, on as a } from "solid-js";
var c = ({ children: i }) => (
	m(
		a(
			t.Messages[0],
			(e) =>
				e?.get("Data")?.get("Session") &&
				n.Data[1](e?.get("Data")?.get("Session")),
		),
	),
	t.Socket[0]()?.send(
		JSON.stringify({
			Key: r.Items[0]()?.get("Key")?.[0](),
			Identifier: r.Items[0]()?.get("Identifier")?.[0](),
			From: "Data",
			View: "User",
		}),
	),
	React.createElement(o.Provider, { value: o.defaultValue }, i)
);
export { c as default };
