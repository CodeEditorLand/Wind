/*
 * File: Wind/Source/Integration/Configuration/Convert/ParseJson.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:20 UTC
 * Dependency: ../Error.js, effect
 */

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
