/*
 * File: Wind/Source/Integration/Tauri/Wrap/RequestOpenDialog.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ../Error.js, @tauri-apps/plugin-dialog, effect
 */

// Source/Integration/Tauri/Wrap/RequestOpenDialog.ts
import { open, type OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import { Effect, Option } from "effect";

import { TauriDialogProblem } from "../Error.js";

// Effect wrapper for Tauri's open dialog, returning an Option.
// This isolates the impure Tauri call and gives it a typed error.
const RequestOpenDialog = (
	Options: OpenDialogOptions,
): Effect.Effect<Option.Option<string | string[]>, TauriDialogProblem> =>
	Effect.tryPromise({
		try: () => open(Options),
		catch: (Cause) => new TauriDialogProblem({ Cause, operation: "open" }),
	}).pipe(Effect.map(Option.fromNullable));

export default RequestOpenDialog;
