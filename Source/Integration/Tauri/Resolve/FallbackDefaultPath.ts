// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path.

import { Effect, Option, pipe } from "effect";

// PathProblem value unused
import { type PathProblem as PathProblemType } from "../Error.js";
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrapper.js";

const ResolveEffect: Effect.Effect<
	Option.Option<string>,
	PathProblemType,
	never
> = pipe(
	FetchHomeDirectory,

	Effect.map((path: string) => Option.some(path)),

	Effect.catchTag(
		"PathProblem",

		(
			// Removed 'as const' if it was causing issues; type narrowing should still work.
			ErrorDetails: PathProblemType,
		) =>
			ErrorDetails.operation === "homeDir"
				? pipe(
						FetchDocumentDirectory,

						Effect.map((docPath: string) => Option.some(docPath)),

						Effect.catchTag(
							// Removed 'as const'
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

export default ResolveEffect;
