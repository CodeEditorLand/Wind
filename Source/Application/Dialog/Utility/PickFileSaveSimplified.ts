// Application/Dialog/Utility/PickFileSaveSimplified.ts
// Purpose: Logic for pickFileToSave in a simplified context.

import { Effect, Option } from "effect";
import { localize } from "vs/nls";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	InheritanceProblem, // Error type for emulated super calls
	ProvideHost, // Dependency Tag for HostService
	Uri,
	type ServiceProblem, // Overall error type for this utility
} from "../../../Integration/Tauri.js";
import PerformShowSave from "../Orchestrate/ShowSave.js"; // Orchestrated logic
import DecideSimplified from "./DecideSimplified.js";

/**
 * @module PickFileSaveSimplified
 * @description Handles picking a file to save in a "simplified" mode, typically for non-native file systems.
 * If the schema is 'file', uses the standard Tauri save dialog logic. Otherwise, emulates a super call.
 * Requires ProvideHost from context if standard save dialog is used.
 */
export default function Pick(
	schema: string,
	options: VsCodeSaveOptions,
): Effect.Effect<
	Uri | undefined,
	ServiceProblem,
	ProvideHost /* + Other abstract deps if super was real */
> {
	if (!DecideSimplified(schema)) {
		// If schema is 'file' (not simplified)
		return PerformShowSave({
			...options,
			title: options.title ?? localize("saveAsTitle", "Save As"),
		}).pipe(Effect.map(Option.getOrUndefined));
	}
	// Placeholder for what super.pickFileToSaveSimplified(schema, options) would be as an Effect.
	// This effect would require all dependencies of AbstractFileDialogService.
	return Effect.fail(
		new InheritanceProblem({
			method: "pickFileToSaveSimplified_Super",
			cause: "Super call for simplified path not implemented in Tauri service for this schema",
		}),
	);
}
