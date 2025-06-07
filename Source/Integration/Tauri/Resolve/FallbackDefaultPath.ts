// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path (e.g., for dialogs).
// It first tries to fetch the home directory. If that fails specifically due to a "homeDir" operation error,

// it then tries to fetch the document directory. Other errors are propagated.

// Removed unused 'pipe'
import { Effect, Option } from "effect";

// Ensure this is the TaggedError class/constructor
import { PathProblem as PathProblemType } from "../Error.js";
// These are functions returning Effect
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrapper.js";

/**
 * An Effect that attempts to resolve a fallback default path.
 * 1. Tries to get the user's home directory.
 * 2. If getting home directory fails with a `PathProblem` specifically for `homeDir` operation:
 *    a. Tries to get the user's document directory.
 *    b. If getting document directory fails with a `PathProblem` for `documentDir`, returns `Option.none()`.
 *    c. Other `PathProblem` errors from document directory are propagated.
 * 3. Any other `PathProblem` from home directory (not `homeDir` operation) or other error types are propagated.
 * @returns Effect<Option.Option<string>, PathProblemType, never>
 *          - Succeeds with `Option.some(path)` if a directory is found.
 *          - Succeeds with `Option.none()` if both attempts fail due to their specific operation errors.
 *          - Fails with `PathProblemType` for other path-related errors.
 */
const ResolveEffect: Effect.Effect<
	Option.Option<string>,
	PathProblemType,
	never
> = FetchHomeDirectory().pipe(
	// Call the function to get the Effect
	// Effect<Option.Option<string>, PathProblemType, never>
	Effect.map(Option.some),

	Effect.catchTag("PathProblem", (homeError: PathProblemType) => {
		// Handle PathProblem errors
		if (homeError.operation === "homeDir") {
			// If homeDir failed, try documentDir
			return FetchDocumentDirectory().pipe(
				// Call the function to get the Effect
				// Effect<Option.Option<string>, PathProblemType, never>
				Effect.map(Option.some),

				Effect.catchTag("PathProblem", (docError: PathProblemType) => {
					if (docError.operation === "documentDir") {
						// If documentDir also failed as expected, succeed with None
						return Effect.succeed(Option.none<string>());
					}

					// If documentDir failed for an unexpected reason, propagate that error
					return Effect.fail(docError);
				}),
			);
		}

		// If homeDir failed for a reason other than 'homeDir' operation (shouldn't happen with current errors)
		// or if it was a different tag (already filtered by catchTag), propagate the original homeError.
		return Effect.fail(homeError);
	}),
);

export default ResolveEffect;
