import { Effect as e } from "../../effect";

class o extends e.Service()("Integration/Tauri", {
	sync: () => ({
		Invoke: (t, n) =>
			e.dieMessage(
				`IntegrationService.Invoke not implemented for command: ${t}`,
			),
		Listen: (t, n) =>
			e.dieMessage("IntegrationService.Listen not implemented"),
		Emit: (t, n) => e.dieMessage("IntegrationService.Emit not implemented"),
	}),
}) {}
export { o as IntegrationService };
