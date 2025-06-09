/*
 * File: Wind/Source/Integration/Tauri/Wrap/ShowMessageDialog.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:56 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/plugin-dialog
 */

// Integration/Tauri/Wrap/ShowMessageDialog.ts
// Purpose: Effect wrapper for Tauri's message dialog.

import { message as SourceApi } from "@tauri-apps/plugin-dialog";

import { FromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Error.js";

const CreateProblem = (cause: unknown): DialogProblem =>
	new DialogProblem({ cause, operation: "message" });

/**
 * @module ShowMessageDialog
 * @description Effect to show a message dialog via Tauri.
 */
const Show = FromAsync(
	SourceApi as (
		message: string,

		options?:
			| string
			| { title?: string; kind?: "info" | "warning" | "error" },
	) => Promise<void>,

	CreateProblem,

	{ operation: "message" },
);

export default Show;
