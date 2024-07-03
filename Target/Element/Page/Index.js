import { Suspense as e, lazy as n } from "solid-js";
const o = n(() => import("../../Context/Action.js")),
	t = n(() => import("../../Context/Connection.js")),
	i = n(() => import("../Editor.js")),
	r = n(() => import("../../Context/Environment.js")),
	l = n(() => import("../../Context/Session.js")),
	p = n(() => import("../../Context/Store.js"));
var a = (s) =>
	React.createElement(
		e,
		null,
		React.createElement(
			r,
			{ Data: s },
			React.createElement(
				e,
				null,
				React.createElement(
					p,
					{
						Data: new Map([
							["Identifier", "Identifier"],
							["Key", "Key"],
						]),
					},
					React.createElement(
						e,
						null,
						React.createElement(
							t,
							null,
							React.createElement(
								e,
								null,
								React.createElement(
									l,
									null,
									React.createElement(
										"div",
										{ class: "flex flex-col" },
										React.createElement(
											"main",
											{
												class: "flex grow justify-center",
											},
											React.createElement(
												"div",
												{
													class: "flex grow self-center",
												},
												React.createElement(
													"div",
													{ class: "container" },
													React.createElement(
														"div",
														{
															class: "grid min-h-screen content-start gap-7 py-9",
														},
														React.createElement(
															"div",
															{
																class: "mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10",
															},
															React.createElement(
																"div",
																{
																	class: "order-last lg:order-first",
																},
																React.createElement(
																	e,
																	null,
																	React.createElement(
																		o,
																		null,
																		React.createElement(
																			e,
																			null,
																			React.createElement(
																				i,
																				{
																					Type: "HTML",
																				},
																			),
																		),
																		React.createElement(
																			e,
																			null,
																			React.createElement(
																				i,
																				{
																					Type: "CSS",
																				},
																			),
																		),
																	),
																),
															),
														),
													),
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
		),
	);
export { a as default };
