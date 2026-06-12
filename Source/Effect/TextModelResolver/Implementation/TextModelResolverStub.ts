import { Effect } from "effect";

import type { TextModelResolverService } from "../Interface/TextModelResolverService.js";

const StubModel = {
	uri: "",

	content: "",

	version: 1,

	languageId: "plaintext",
} as const;

export const StubTextModelResolverService: TextModelResolverService = {
	Resolve: (uri) =>
		Effect.succeed({
			model: { ...StubModel, uri },
			dispose: () => {
				// no-op stub
			},
		}),

	HasModel: (_uri) => Effect.succeed(false),

	Reload: (uri) => Effect.succeed({ ...StubModel, uri }),
};

export default StubTextModelResolverService;
