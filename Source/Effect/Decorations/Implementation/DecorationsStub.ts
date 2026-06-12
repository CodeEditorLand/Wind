import type { DecorationsService } from "../Interface/DecorationsService.js";

export const StubDecorationsService: DecorationsService = {
	GetDecoration: async (_uri, _includeChildren) => null,

	GetDecorations: async (_uris) => new Map(),

	SetDecoration: async (_uri, _decoration) => {},

	ClearDecoration: async (_uri) => {},
};

export default StubDecorationsService;
