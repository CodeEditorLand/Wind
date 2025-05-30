// Integration/Tauri/Resolve/FinalDefaultPath.ts
// Purpose: Composed Effect for determining the final default path for dialogs.

import { Effect, Option, pipe } from "effect";

import type { Uri } from "../../../Platform/VSCode/Types.js";
import ConvertUriToPath from "../Converters/UriToPathString.js"; // Use direct path for clarity

import type { PathProblem } from "../Errors.js";
import ResolveFallback from "./FallbackDefaultPath.js"; // Use the other resolver

/**
 * @module FinalDefaultPath
 * @description Effectfully gets a dialog's final default path.
 * Tries a provided URI first, then uses a fallback mechanism.
 */
export default function Resolve(
	MaybeUri?: Uri,
): Effect.Effect<Option.Option<string>, PathProblem> {
	return pipe(
		ConvertUriToPath(MaybeUri), // Pure conversion
		Option.match({
			onSome: (PathString) => Effect.succeed(Option.some(PathString)),
			onNone: () => ResolveFallback, // Use the composed fallback effect
		}),
	);
}
