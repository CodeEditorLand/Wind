import { Effect as e, Layer as r } from "effect";

import { BootstrapTag as o } from "../Tag/BootstrapTag.js";

const s = () => ({
		run: (t) =>
			e.gen(function* () {
				return (
					yield* e.sleep("1 millis"),
					{
						success: !0,
						totalDuration: 1,
						stages: [
							{
								stageName: "Environment",
								success: !0,
								duration: 0,
								error: void 0,
							},
							{
								stageName: "Preload",
								success: !0,
								duration: 0,
								error: void 0,
							},
							{
								stageName: "Configuration",
								success: !0,
								duration: 0,
								error: void 0,
							},
							{
								stageName: "Services",
								success: !0,
								duration: 0,
								error: void 0,
							},
							{
								stageName: "Preparation",
								success: !0,
								duration: 0,
								error: void 0,
							},
							{
								stageName: "Initialization",
								success: !0,
								duration: 0,
								error: void 0,
							},
							...(t?.skipHealthCheck
								? []
								: [
										{
											stageName: "HealthCheck",
											success: !0,
											duration: 0,
											error: void 0,
										},
									]),
						],
						error: void 0,
					}
				);
			}),
	}),
	a = r.effect(o, e.succeed(s()));
var i = a;
export { a as BootstrapMock, i as default, s as makeMockBootstrap };
