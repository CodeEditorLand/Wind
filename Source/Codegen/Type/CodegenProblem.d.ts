/**
 * @module Codegen/Type/CodegenProblem
 * @description
 * Typed error ADT for the codegen pipeline. Each variant carries
 * the diagnostic context the orchestrator needs to surface to the
 * developer running `pnpm run Codegen`.
 * @category Type
 */
export type CodegenProblem =
	| {
			readonly _tag: "CodegenSourceTreeMissing";

			readonly path: string;
	  }
	| {
			readonly _tag: "CodegenFileReadFailed";

			readonly path: string;

			readonly error: Error;
	  }
	| {
			readonly _tag: "CodegenParseFailed";

			readonly path: string;

			readonly error: Error;
	  }
	| {
			readonly _tag: "CodegenEmitFailed";

			readonly path: string;

			readonly error: Error;
	  };

//# sourceMappingURL=CodegenProblem.d.ts.map
