import { Effect } from "effect";

import type { WorkingCopyService } from "../Interface/WorkingCopyService.js";

export const StubWorkingCopyService: WorkingCopyService = {
	IsDirty: (_uri) => Effect.succeed(false),

	SetDirty: (_uri, _dirty) => Effect.void,

	GetAllDirty: () => Effect.succeed([]),

	GetDirtyCount: () => Effect.succeed(0),
};

export default StubWorkingCopyService;
