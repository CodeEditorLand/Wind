// Integration/Tauri/Resolve/FallbackDefaultPath.ts
// Purpose: Composed Effect for determining a fallback default path.

import { Effect, Option, pipe } from "effect";

import type { PathProblem } from "../Errors.js"; // Use aggregator for Errors

// Import specific wrapped effects needed
import { FetchDocumentDirectory, FetchHomeDirectory } from "../Wrappers.js"; // Use aggregator for Wrappers

/**
 * @module FallbackDefaultPath
 * @description Effect that attempts to get a fallback default path,
 * trying home directory then document directory.
 */
const Resolve = pipe(
	// Renamed effectGetFallbackDefaultPath
	FetchHomeDirectory,
	Effect.map(Option.some),
	Effect.catchTag("PathProblem", (ErrorDetails) =>
		ErrorDetails.operation === "homeDir"
			? pipe(
					FetchDocumentDirectory,
					Effect.map(Option.some),
					Effect.catchTag("PathProblem", (ErrorDetailsDoc) =>
						ErrorDetailsDoc.operation === "documentDir"
							? Effect.succeed(Option.none<string>())
							: Effect.fail(ErrorDetailsDoc),
					),
				)
			: Effect.fail(ErrorDetails),
	),
);
export default Resolve;
