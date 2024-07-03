import e from "../../Context/Connection/Context.js";
import a from "../Button.js";
import i from "../Tip.js";
import "@Script/Tippy/Style/Theme/BorderDark.scss";
import "@Script/Tippy/Style/Theme/BorderLight.scss";
import "tippy.js/animations/shift-away.css";
import "tippy.js/dist/tippy.css";
var y = async (s) => {
	const { Class: o, ClassButton: n } = (
		await import("../../Function/Merge.js")
	).default({ Class: "", ClassButton: "" }, s);
	return React.createElement(
		i,
		{
			Class: typeof o == "function" ? o() : o,
			Content: "Connecting.",
			onMount: async (t) =>
				(await import("solid-js")).createEffect(
					(await import("solid-js")).on(
						e.Status[0],
						(r) => t._tippy.setContent(r),
						{ defer: !1 },
					),
				),
		},
		React.createElement(a, {
			Class: () => {
				let t = `Status ${typeof n == "function" ? n() : n}`;
				switch (e.State()) {
					case 0: {
						t += " Connecting";
						break;
					}
					case 1: {
						t += " Connected";
						break;
					}
					case 2: {
						t += " Disconnecting";
						break;
					}
					case 3: {
						t += " Disconnected";
						break;
					}
					default: {
						t += " Disconnected";
						break;
					}
				}
				return t;
			},
			Action: () =>
				[0, 1].indexOf(e.State()) === -1
					? e.Socket[0]()?.reconnect()
					: e.Socket[0]()?.close(1e3, "Closing socket."),
			Label: "Indicates the status of your connection to the WebSocket.",
		}),
	);
};
export { y as default };
