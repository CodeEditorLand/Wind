import type { Effect } from "effect";

import type { WorkbenchDialogProblem } from "../Type/WorkbenchDialogProblem.js";

export interface WorkbenchDialogConfirmOptions {
	readonly message: string;

	readonly detail?: string;

	readonly primaryButton?: string;

	readonly cancelButton?: string;

	readonly type?: "info" | "question" | "warning" | "error";
}

export interface WorkbenchDialogConfirmResult {
	readonly confirmed: boolean;

	readonly checkboxChecked?: boolean;
}

export interface WorkbenchDialogPickOptions {
	readonly message: string;

	readonly detail?: string;

	readonly choices: ReadonlyArray<string>;

	readonly cancelId?: number;
}

export interface WorkbenchDialogService {
	readonly Confirm: (
		options: WorkbenchDialogConfirmOptions,
	) => Effect.Effect<WorkbenchDialogConfirmResult, WorkbenchDialogProblem>;

	readonly Pick: (
		options: WorkbenchDialogPickOptions,
	) => Effect.Effect<number, WorkbenchDialogProblem>;

	readonly Info: (
		message: string,

		detail?: string,
	) => Effect.Effect<void, WorkbenchDialogProblem>;

	readonly Error: (
		message: string,

		detail?: string,
	) => Effect.Effect<void, WorkbenchDialogProblem>;
}
