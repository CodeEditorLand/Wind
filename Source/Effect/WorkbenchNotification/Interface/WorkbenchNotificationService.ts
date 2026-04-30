import type { Effect, Stream } from "effect";

import type {
	WorkbenchNotificationProblem,
	WorkbenchNotificationSeverity,
} from "../Type/WorkbenchNotificationProblem.js";

export interface WorkbenchNotificationOptions {
	readonly severity: WorkbenchNotificationSeverity;
	readonly message: string;
	readonly source?: string;
	readonly silent?: boolean;
}

export interface WorkbenchNotificationDispatched {
	readonly severity: WorkbenchNotificationSeverity;
	readonly message: string;
	readonly source: string | undefined;
}

export interface WorkbenchNotificationService {
	readonly Notify: (
		options: WorkbenchNotificationOptions,
	) => Effect.Effect<void, WorkbenchNotificationProblem>;

	readonly Info: (
		message: string,
	) => Effect.Effect<void, WorkbenchNotificationProblem>;

	readonly Warn: (
		message: string,
	) => Effect.Effect<void, WorkbenchNotificationProblem>;

	readonly Error: (
		message: string,
	) => Effect.Effect<void, WorkbenchNotificationProblem>;

	readonly OnDispatched: Stream.Stream<
		WorkbenchNotificationDispatched,
		WorkbenchNotificationProblem
	>;
}
