import type { WorkingCopyService } from "../Interface/WorkingCopyService.js";

export const StubWorkingCopyService: WorkingCopyService = {
	IsDirty: (_uri) => false,

	SetDirty: (_uri, _dirty) => {},

	GetAllDirty: () => [],

	GetDirtyCount: () => 0,
};

export default StubWorkingCopyService;
