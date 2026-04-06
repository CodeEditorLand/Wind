import { Effect } from "effect";

import type { ModelService } from "../Interface/ModelService.js";

export const StubModelService: ModelService = {
	OpenModel: (uri) =>
		Effect.succeed({
			uri,
			content: "",
			version: 1,
			languageId: "plaintext",
		}),
	CloseModel: (_uri) => Effect.void,
	GetModel: (_uri) => Effect.succeed(null),
	GetAllModels: () => Effect.succeed([]),
	UpdateContent: (uri, content) =>
		Effect.succeed({
			uri,
			content,
			version: 1,
			languageId: "plaintext",
		}),
};

export default StubModelService;
