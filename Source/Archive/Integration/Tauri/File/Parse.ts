/**
 * @module Parse
 * @description
 * Defines a safe Effect for parsing a JSON string.
 */

import { Effect } from "effect";

import { TauriConfigurationProblem } from "../Configuration/Problem.js";

/**
 * An Effect that safely parses a JSON string into an object.
 * This is a standard library operation wrapped in an Effect for type-safe
 * error handling within Effect pipelines.
 *
 * @param JSONString The JSON string to parse.
 * @returns An `Effect` that resolves to an `object` or fails with a
 * `TauriConfigurationProblem`.
 */
export const ParseJSON = (
	JSONString: string,
): Effect.Effect<object, TauriConfigurationProblem> =>
	Effect.try({
		try: () => JSON.parse(JSONString),
		catch: (Cause) =>
			new TauriConfigurationProblem({
				Cause,
				Context: "JSONParseFailed",
			}),
	});
