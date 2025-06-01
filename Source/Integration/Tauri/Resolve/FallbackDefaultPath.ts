// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path.

import { Effect, Option, pipe } from "effect";

// Aggregator
import { PathProblem, type PathProblem as PathProblemType } from "../Error.js";
// Aggregator
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrapper.js";

/**
 * @module FallbackDefaultPath (Resolver)
 * @description Effect that attempts to get a fallback default path,


 * trying home directory then document directory. Yields Option<string>.
 */
const ResolveEffect: Effect.Effect<
	Option.Option<string>,
	PathProblemType,
	never
> = pipe(
	// Effect<string, PathProblemType, never>
	FetchHomeDirectory,

	// Effect<Option<string>, PathProblemType, never>
	Effect.map((path: string) => Option.some(path)),

	Effect.catchTag(
		"PathProblem" as const,

		(
			// Use "PathProblem" as const
			ErrorDetails: PathProblemType,
		) =>
			ErrorDetails.operation === "homeDir"
				? pipe(
						// Effect<string, PathProblemType, never>
						FetchDocumentDirectory,

						// Effect<Option<string>, PathProblemType, never>
						Effect.map((docPath: string) => Option.some(docPath)),

						Effect.catchTag(
							// Use "PathProblem" as const
							"PathProblem" as const,

							(ErrorDetailsDoc: PathProblemType) =>
								ErrorDetailsDoc.operation === "documentDir"
									? // Effect<Option<string>, never, never>
										Effect.succeed(Option.none<string>())
									: // Effect<never, PathProblemType, never>
										Effect.fail(ErrorDetailsDoc),
						),

						// This inner pipe becomes Effect<Option<string>, PathProblemType, never>
					)
				: // Effect<never, PathProblemType, never>
					Effect.fail(ErrorDetails),
	),

	// Overall type should be Effect<Option<string>, PathProblemType, never>
);

export default ResolveEffect;
