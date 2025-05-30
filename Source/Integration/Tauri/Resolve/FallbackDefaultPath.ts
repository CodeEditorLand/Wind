// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path.

import { Effect, Option, pipe } from "effect";

import { PathProblem, type PathProblem as PathProblemType } from "../Errors.js"; // Use aggregator, imports both value and type
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrappers.js"; // Use aggregator

// Explicit type import if needed

/**
 * @module FallbackDefaultPath
 * @description Effect that attempts to get a fallback default path,
 * trying home directory then document directory.
 */
const Resolve = pipe(
	FetchHomeDirectory, // This Effect has PathProblem in its E channel
	Effect.map(Option.some),
	Effect.catchTag("PathProblem", (e: PathProblemType) => {
		// Explicitly type 'e' if inference fails
		if (e.operation === "homeDir") {
			// Now 'e.operation' should be accessible
			return pipe(
				FetchDocumentDirectory,
				Effect.map(Option.some),
				Effect.catchTag("PathProblem", (e2: PathProblemType) =>
					e2.operation === "documentDir"
						? Effect.succeed(Option.none<string>())
						: Effect.fail(e2),
				),
			);
		}
		return Effect.fail(e);
	}),
);
export default Resolve;
