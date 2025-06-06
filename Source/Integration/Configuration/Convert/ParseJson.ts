import { Effect } from "effect";

import { JsonParseProblem } from "../Error.js";

const ParseJson = (
	RawString: string,
): Effect.Effect<unknown, JsonParseProblem> =>
	Effect.try({
		try: () => JSON.parse(RawString),
		catch: (cause) => new JsonParseProblem({ cause }),
	});

export default ParseJson;
