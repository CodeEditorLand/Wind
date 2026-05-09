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
