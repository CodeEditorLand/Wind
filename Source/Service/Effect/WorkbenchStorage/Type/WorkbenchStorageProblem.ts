/**
 * @module Effect/WorkbenchStorage/Type/WorkbenchStorageProblem
 * @description
 * Typed error ADT for the workbench-tier storage service. Mirrors
 * VS Code's `IStorageService` failure surface plus the bridge-
 * unavailable case Wind layers handle uniformly.
 * @category Type
 */

export type WorkbenchStorageProblem =
	| {
			readonly _tag: "WorkbenchStorageBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchStorageReadFailed";

			readonly key: string;

			readonly scope: number;

			readonly error: Error;
	  }
	| {
			readonly _tag: "WorkbenchStorageWriteFailed";

			readonly key: string;

			readonly scope: number;

			readonly error: Error;
	  }
	| {
			readonly _tag: "WorkbenchStorageRemoveFailed";

			readonly key: string;

			readonly scope: number;

			readonly error: Error;
	  };

export class WorkbenchStorageError extends Error {
	readonly _tag = "WorkbenchStorageError" as const;

	constructor(readonly Problem: WorkbenchStorageProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchStorageError";
	}
}
