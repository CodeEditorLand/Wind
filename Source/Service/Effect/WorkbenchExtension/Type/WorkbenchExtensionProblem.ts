export type WorkbenchExtensionProblem =
	| {
			readonly _tag: "WorkbenchExtensionBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchExtensionActivationFailed";

			readonly extensionId: string;

			readonly error: Error;
	  };

export class WorkbenchExtensionError extends Error {
	readonly _tag = "WorkbenchExtensionError" as const;

	constructor(readonly Problem: WorkbenchExtensionProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchExtensionError";
	}
}
