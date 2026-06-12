import type { LabelService } from "../Interface/LabelService.js";

export const StubLabelService: LabelService = {
	GetUriLabel: (uri, _options) => uri,

	GetWorkspaceLabel: () => "",

	GetBaseLabel: (uri) => uri.split("/").pop() ?? uri,
};

export default StubLabelService;
