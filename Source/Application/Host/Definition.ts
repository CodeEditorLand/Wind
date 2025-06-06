import { Effect, Layer, Runtime, Scope } from "effect";

import { type PerformAction as HostService } from "../../Platform/VSCode/Provide/Host.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";

// This service has no external dependencies, so its runtime is simple.
const ServiceRuntime: Runtime.Runtime<never> = Runtime.defaultRuntime;

function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, never>,
): Promise<A> {
	return Runtime.runPromise(ServiceRuntime, eff);
}

const Definition: HostService = {
	openWindow: (targets, options) =>
		_run(Orchestrate.OpenWindow(targets, options)),
};

export default Definition;
