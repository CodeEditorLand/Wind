import { Effect } from "effect";

import type { ProgressService } from "../Interface/ProgressService.js";

export const StubProgressService: ProgressService = {
	Begin: (_options) => Effect.succeed("stub-progress-0"),
	Report: (_id, _report) => Effect.void,
	End: (_id) => Effect.void,
};

export default StubProgressService;
