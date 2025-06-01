// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path.

import { Effect, Option, pipe } from "effect";

import { PathProblem, type PathProblem as PathProblemType } from "../Error.js"; // Aggregator
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrapper.js"; // Aggregator

// Explicit type import

/**
 * @module FallbackDefaultPath (Resolver)
 * @description Effect that attempts to get a fallback default path,
 * trying home directory then document directory. Yields Option<string>.
 */
const Resolve = pipe(
	FetchHomeDirectory,
	Effect.map(Option.some),
	Effect.catchTag(
		"PathProblem",
		(
			ErrorDetails: PathProblemType, // Explicit type for clarity
		) =>
			ErrorDetails.operation === "homeDir"
				? pipe(
						FetchDocumentDirectory,
						Effect.map(Option.some),
						Effect.catchTag(
							"PathProblem",
							(ErrorDetailsDoc: PathProblemType) =>
								ErrorDetailsDoc.operation === "documentDir"
									? Effect.succeed(Option.none<string>())
									: Effect.fail(ErrorDetailsDoc),
						),
					)
				: Effect.fail(ErrorDetails),
	),
);
export default Resolve;
