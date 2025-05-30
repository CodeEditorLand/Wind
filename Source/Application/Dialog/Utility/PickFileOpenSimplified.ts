// Application/Dialog/Utility/PickFileOpenSimplified.ts
// Purpose: Logic for pickFileAndOpen in a simplified context as an Effect.

import { Effect } from "effect";
import type { IPickAndOpenOptions as VsCodePickOptions } from "vs/platform/dialogs/common/dialogs";

import {
	InheritanceProblem,
	ProvideHost,
	type ServiceProblem,
} from "../../../Integration/Tauri.js";
import PerformPickAndOpen from "../Orchestrate/PickAndOpen.js";
import DecideSimplified from "./DecideSimplified.js";

/**
 * @module PickFileOpenSimplified
 * @description Handles picking a file and opening it in a "simplified" mode.
 * Requires ProvideHost from context if standard pick/open logic is used.
 */
export default function Pick(
	schema: string,
	options: VsCodePickOptions,
	_remote: boolean, // remote parameter might be used by a "super" call, unused here
): Effect.Effect<
	void,
	ServiceProblem,
	ProvideHost /* + Other abstract deps */
> {
	if (!DecideSimplified(schema)) {
		// If schema is 'file'
		return PerformPickAndOpen(options, {
			titleKey: "openFileDefaultTitle",
			defaultTitle: "Open File",
			tauriDirectory: false,
			itemType: "file",
		});
	}
	return Effect.fail(
		new InheritanceProblem({
			method: "pickFileOpenSimplified_Super",
			cause: "Super call for simplified path not implemented",
		}),
	);
}
