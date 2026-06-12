export type WorkbenchKeybindingProblem =
	| {
			readonly _tag: "WorkbenchKeybindingBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchKeybindingResolveFailed";

			readonly chord: string;

			readonly error: Error;
	  };

export class WorkbenchKeybindingError extends Error {
	readonly _tag = "WorkbenchKeybindingError" as const;

	constructor(readonly Problem: WorkbenchKeybindingProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchKeybindingError";
	}
}
