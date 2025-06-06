// Source/Application/Workbench/Error/WorkbenchProblem.ts
import { Data } from "effect";

// A specific error for when the workbench fails during startup.
export default class Problem extends Data.TaggedError("WorkbenchProblem")<{
	readonly cause: unknown;
	readonly context:
		| "ServiceInitialization"
		| "LayoutRendering"
		| "Restoration";
}> {}
