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
	) => Promise<string | undefined>;

	readonly ShowProgress: (
		title: string,

		cancellable: boolean,
	) => Promise<string>;

	readonly UpdateProgress: (
		id: string,

		increment: number,

		message?: string,
	) => Promise<void>;

	readonly EndProgress: (id: string) => Promise<void>;
}
