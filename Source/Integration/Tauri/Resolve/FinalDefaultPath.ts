// Integration/Tauri/Resolve/FinalDefaultPath.ts
// Purpose: Composed Effect for determining the final default path for dialogs.

import { Effect, Option, pipe } from "effect";

import type { Uri } from "../../../Platform/VSCode/Type.js";
import { ConvertUriToPathString } from "../Converter.js"; // Aggregator

import type { PathProblem } from "../Error.js";
import ResolveFallbackDefaultPath from "./FallbackDefaultPath.js";

/**
 * @module FinalDefaultPath (Resolver)
 * @description Effectfully gets a dialog's final default path.
 * Tries a provided URI first, then uses a fallback mechanism. Yields Option<string>.
 */
export default function Resolve(
	MaybeUri?: Uri,
): Effect.Effect<Option.Option<string>, PathProblem> {
	return pipe(
		ConvertUriToPathString(MaybeUri), // Pure conversion
		Option.match({
			onSome: (PathString) => Effect.succeed(Option.some(PathString)),
			onNone: () => ResolveFallbackDefaultPath,
		}),
	);
}
