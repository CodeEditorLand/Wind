import type { Effect } from "effect";

import type { QuickInputProblem } from "../Type/QuickInputProblem.js";

export interface QuickPickItem {

	readonly label: string;

	readonly description?: string;

	readonly detail?: string;

	readonly picked?: boolean;
}

export interface QuickPickOptions {

	readonly placeholder?: string;

	readonly canPickMany?: boolean;

	readonly title?: string;
}

export interface InputBoxOptions {

	readonly prompt?: string;

	readonly placeholder?: string;

	readonly password?: boolean;

	readonly value?: string;

	readonly title?: string;
}

export interface QuickInputService {

	readonly ShowQuickPick: (
		items: readonly QuickPickItem[],

		options?: QuickPickOptions,
	) => Effect.Effect<QuickPickItem | undefined, QuickInputProblem>;

	readonly ShowInputBox: (
		options?: InputBoxOptions,
	) => Effect.Effect<string | undefined, QuickInputProblem>;
}
