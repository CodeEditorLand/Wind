import { Effect } from "effect";

import type { DecorationsService } from "../Interface/DecorationsService.js";

export const StubDecorationsService: DecorationsService = {
	GetDecoration: (_uri, _includeChildren) => Effect.succeed(null),

	GetDecorations: (_uris) => Effect.succeed(new Map()),

	SetDecoration: (_uri, _decoration) => Effect.void,

	ClearDecoration: (_uri) => Effect.void,
};

export default StubDecorationsService;
