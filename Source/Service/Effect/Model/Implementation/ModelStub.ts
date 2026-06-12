import type { ModelService } from "../Interface/ModelService.js";

export const StubModelService: ModelService = {
	OpenModel: (uri) =>
		Promise.resolve({
			uri,
			content: "",
			version: 1,
			languageId: "plaintext",
		}),

	CloseModel: (_uri) => Promise.resolve(),

	GetModel: (_uri) => Promise.resolve(null),

	GetAllModels: () => Promise.resolve([]),

	UpdateContent: (uri, content) =>
		Promise.resolve({
			uri,
			content,
			version: 1,
			languageId: "plaintext",
		}),
};

export default StubModelService;
