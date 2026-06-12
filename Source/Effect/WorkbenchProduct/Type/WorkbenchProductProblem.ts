export type WorkbenchProductProblem = {
	readonly _tag: "WorkbenchProductBridgeUnavailable";

	readonly reason: string;
};

export class WorkbenchProductError extends Error {
	readonly _tag = "WorkbenchProductError" as const;

	constructor(readonly Problem: WorkbenchProductProblem) {
		super(Problem.reason);

		this.name = "WorkbenchProductError";
	}
}
