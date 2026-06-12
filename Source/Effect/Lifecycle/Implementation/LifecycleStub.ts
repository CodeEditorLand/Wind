import { Effect } from "effect";

import type {
	LifecyclePhaseValue,
	LifecycleService,
} from "../Interface/LifecycleService.js";

export const StubLifecycleService: LifecycleService = {
	GetPhase: () => Effect.succeed(4 as LifecyclePhaseValue),

	WhenPhase: (_phase) => Effect.void,

	RequestShutdown: () => Effect.void,

	AdvancePhase: (_phase) => Effect.void,
};

export default StubLifecycleService;
