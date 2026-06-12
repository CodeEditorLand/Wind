import type { Effect } from "effect";

import type { NotificationProblem } from "../Type/NotificationProblem.js";

export type NotificationSeverity = "info" | "warning" | "error";

export interface NotificationAction {

	readonly title: string;
}

export interface NotificationService {

	readonly Show: (
		message: string,

		severity: NotificationSeverity,

		actions?: readonly NotificationAction[],
	) => Effect.Effect<string | undefined, NotificationProblem>;

	readonly ShowProgress: (
		title: string,

		cancellable: boolean,
	) => Effect.Effect<string, NotificationProblem>;

	readonly UpdateProgress: (
		id: string,

		increment: number,

		message?: string,
	) => Effect.Effect<void, NotificationProblem>;

	readonly EndProgress: (
		id: string,
	) => Effect.Effect<void, NotificationProblem>;
}
