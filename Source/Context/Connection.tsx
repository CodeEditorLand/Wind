export default async ({ children }: { children?: JSX.Element }) => {
	const { createEffect, on } = await import("solid-js");

	const { default: Connection, _Function } = await import(
		"@Context/Connection/Context.js"
	);

	createEffect(
		on(
			Connection.State,
			(State) => Connection.Status[1](Connection.States[State]),
			{
				defer: false,
			},
		),
	);

	createEffect(
		on(
			Connection.Socket[0],
			(WebSocket) =>
				WebSocket?.addEventListener("message", async (Message) =>
					Connection.Messages[1](
						(await import("@Function/Merge.js")).default(
							Connection.Messages[0](),
							await (
								await import(
									"@codeeditorland/common/Target/Function/Get.js"
								)
							).default(JSON.parse(Message.data)),
						),
					),
				),
			{ defer: false },
		),
	);

	return (
		<_Function.Provider value={_Function.defaultValue}>
			{children}
		</_Function.Provider>
	);
};

import type { JSX } from "solid-js";
