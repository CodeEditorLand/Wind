export type WorkbenchNotificationProblem =
	| {
			readonly _tag: "WorkbenchNotificationBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchNotificationDispatchFailed";

			readonly error: Error;
	  };

export type WorkbenchNotificationSeverity = "Info" | "Warning" | "Error";

export class WorkbenchNotificationError extends Error {
	readonly _tag = "WorkbenchNotificationError" as const;

	constructor(readonly Problem: WorkbenchNotificationProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchNotificationError";
	}
}
