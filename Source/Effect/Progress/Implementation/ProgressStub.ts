import type { ProgressService } from "../Interface/ProgressService.js";

export const StubProgressService: ProgressService = {
	Begin: (_options) => Promise.resolve("stub-progress-0"),

	Report: (_id, _report) => Promise.resolve(),

	End: (_id) => Promise.resolve(),
};

export default StubProgressService;
