import { For as s, Show as i } from "solid-js";
var m = ({ Of: r, rel: t, type: o, crossorigin: n }) =>
	React.createElement(s, { each: r }, (e) =>
		React.createElement(
			i,
			{ when: e },
			e &&
				React.createElement("link", {
					type: o ?? "text/css",
					rel: t ?? "preconnect",
					crossorigin: n ?? "anonymous",
					href: e,
				}),
		),
	);
export { m as default };
