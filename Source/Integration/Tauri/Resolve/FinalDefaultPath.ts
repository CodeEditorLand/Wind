/*
 * File: Wind/Source/Integration/Tauri/Resolve/FinalDefaultPath.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:58 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ../Converter.js, ../Error.js, ./FallbackDefaultPath.js, effect
 * Export: Resolve
 */

// Integration/Tauri/Resolve/FinalDefaultPath.ts
// Purpose: Composed Effect for determining the final default path for dialogs.

import { Effect, Option, pipe } from "effect";

import type { Uri } from "../../../Platform/VSCode/Type.js";
// Aggregator
import { ConvertUriToPathString } from "../Converter.js";
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
		// Pure conversion
		ConvertUriToPathString(MaybeUri),

		Option.match({
			onSome: (PathString) => Effect.succeed(Option.some(PathString)),

			onNone: () => ResolveFallbackDefaultPath,
		}),
	);
}
