import type {
	LifecyclePhaseValue,
	LifecycleService,
} from "../Interface/LifecycleService.js";

export const StubLifecycleService: LifecycleService = {
	GetPhase: async () => 4 as LifecyclePhaseValue,

	WhenPhase: async (_phase) => {},

	RequestShutdown: async () => {},

	AdvancePhase: async (_phase) => {},
};

export default StubLifecycleService;
