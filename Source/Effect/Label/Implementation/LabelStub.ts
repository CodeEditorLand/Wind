import { Effect } from "effect";

import type { LabelService } from "../Interface/LabelService.js";

export const StubLabelService: LabelService = {

	GetUriLabel: (uri, _options) => Effect.succeed(uri),

	GetWorkspaceLabel: () => Effect.succeed(""),

	GetBaseLabel: (uri) => Effect.succeed(uri.split("/").pop() ?? uri),
};

export default StubLabelService;
