// Application/Dialog/Utility/PickWorkspaceOpenSimplified.ts
// Purpose: Logic for pickWorkspaceAndOpen in a simplified context as an Effect.

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
 * @module PickWorkspaceOpenSimplified
 * @description Handles picking a workspace and opening it in a "simplified" mode.
 * Requires ProvideHost from context if standard pick/open logic is used.
 */
export default function Pick(
	schema: string,
	options: VsCodePickOptions,
): Effect.Effect<
	void,
	ServiceProblem,
	ProvideHost /* + Other abstract deps */
> {
	if (!DecideSimplified(schema)) {
		// If schema is 'file'
		return PerformPickAndOpen(options, {
			titleKey: "openWorkspaceDefaultTitle",
			defaultTitle: "Open Workspace",
			tauriDirectory: false,
			itemType: "workspace",
			defaultWorkspaceFilter: true,
		});
	}
	return Effect.fail(
		new InheritanceProblem({
			method: "pickWorkspaceOpenSimplified_Super",
			cause: "Super call for simplified path not implemented",
		}),
	);
}
