/**
 * @module Codegen/Codegen
 * @description
 * Default-export entry point. Resolves the source / output paths
 * from `process.cwd()` (Wind's package root) and runs the codegen
 * pipeline. Designed to be invoked by `prepublishOnly.sh` via
 *
 *   node --import tsx Source/Codegen/Codegen.ts
 *
 * or its compiled-equivalent. Exits with non-zero on any
 * `CodegenProblem` so build pipelines fail loudly.
 * @category Orchestration
 */

import { resolve } from "node:path";

import { RunCodegen } from "./RunCodegen.js";

const Main = async (): Promise<void> => {
	const Cwd = process.cwd();
	const SourceRoot = resolve(
		Cwd,
		"..",
		"..",
		"Dependency",
		"Microsoft",
		"Dependency",
		"Editor",
		"src",
	);
	const OutputRoot = resolve(Cwd, "Source");

	const Result = await RunCodegen({ SourceRoot, OutputRoot });
	if ("_tag" in Result) {
		// eslint-disable-next-line no-console
		console.error(`[Wind/Codegen] FAILED: ${Result._tag}`);
		process.exit(1);
	}
	if (Result.Failures.length > 0) {
		// eslint-disable-next-line no-console
		console.error(
			`[Wind/Codegen] completed with ${Result.Failures.length} failures`,
		);
		process.exit(2);
	}
	// eslint-disable-next-line no-console
	console.log(
		`[Wind/Codegen] OK - ${Result.RecordsEmitted} services + ${Result.CommandsEmitted} commands in ${Result.DurationMilliseconds}ms`,
	);
};

void Main();
