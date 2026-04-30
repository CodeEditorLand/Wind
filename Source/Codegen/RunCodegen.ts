/**
 * @module Codegen/RunCodegen
 * @description
 * Top-level orchestrator. Runs the codegen pipeline end-to-end:
 *
 *   1. Walk the VS Code source tree (`Dependency/Microsoft/
 *      Dependency/Editor/src/`) via `WalkSourceTree`.
 *   2. Stream files through `IterateServiceDecorators` to yield
 *      one `ServiceDecoratorRecord` per `createDecorator(...)` site.
 *   3. For each record, emit `<Wind>/Source/Effect/Generated/
 *      <DecoratorName>/<DecoratorName>Upstream.ts` via
 *      `EmitServiceSchema`.
 *   4. After all schemas land, emit a single
 *      `Effect/Generated/ServiceCatalog.ts` index of every
 *      decorator with metadata.
 *
 * The orchestrator is async-iterator-driven: records are emitted
 * as soon as their source file is parsed, no whole-tree buffering.
 * The catalog emit is the only step that holds every record in
 * memory at once (one row per decorator, ~500 entries - trivial).
 *
 * Invoked by `Wind/Source/prepublishOnly.sh` ahead of the TS
 * compile step so the Wind compile picks up the freshly generated
 * schemas. The orchestrator never throws - every error path
 * returns a `CodegenProblem` so the caller can surface a clean
 * exit code.
 * @category Orchestration
 */

import { existsSync } from "node:fs";

import type { CodegenProblem } from "./Type/CodegenProblem.js";
import type { ServiceDecoratorRecord } from "./Type/ServiceDecoratorRecord.js";

import { EmitServiceCatalog } from "./Emit/EmitServiceCatalog.js";
import { EmitServiceSchema } from "./Emit/EmitServiceSchema.js";
import { IterateServiceDecorators } from "./Extract/IterateServiceDecorators.js";
import { WalkSourceTree } from "./Walk/SourceTreeWalker.js";

export interface RunCodegenOptions {
	readonly SourceRoot: string;
	readonly OutputRoot: string;
	readonly Log?: (message: string) => void;
}

export interface RunCodegenSummary {
	readonly RecordsEmitted: number;
	readonly CatalogPath: string;
	readonly Failures: ReadonlyArray<CodegenProblem>;
	readonly DurationMilliseconds: number;
}

const DefaultLog = (message: string): void => {
	// eslint-disable-next-line no-console
	console.log(`[Wind/Codegen] ${message}`);
};

export const RunCodegen = async (
	options: RunCodegenOptions,
): Promise<RunCodegenSummary | CodegenProblem> => {
	const Log = options.Log ?? DefaultLog;
	const Started = performance.now();

	if (!existsSync(options.SourceRoot)) {
		return {
			_tag: "CodegenSourceTreeMissing",
			path: options.SourceRoot,
		};
	}

	Log(`source root: ${options.SourceRoot}`);
	Log(`output root: ${options.OutputRoot}`);

	const Files = WalkSourceTree({
		Root: options.SourceRoot,
		IncludeExtensions: [".ts"],
		ExcludeSegments: [],
	});

	const Records: ServiceDecoratorRecord[] = [];
	const Failures: CodegenProblem[] = [];

	for await (const Record of IterateServiceDecorators(Files)) {
		Records.push(Record);
		const SchemaResult = await EmitServiceSchema({
			Record,
			OutputRoot: options.OutputRoot,
		});
		if ("_tag" in SchemaResult) {
			Failures.push(SchemaResult);
			Log(
				`failed to emit schema for ${Record.DecoratorName}: ${SchemaResult._tag}`,
			);
			continue;
		}
		Log(
			`emitted ${SchemaResult.OutputPath} (${SchemaResult.Members} members, ${SchemaResult.Bytes}B)`,
		);
	}

	Log(`discovered ${Records.length} decorators`);

	const CatalogResult = await EmitServiceCatalog({
		Records,
		OutputRoot: options.OutputRoot,
	});
	if ("_tag" in CatalogResult) {
		Failures.push(CatalogResult);
		return CatalogResult;
	}

	const Elapsed = Math.round(performance.now() - Started);
	Log(
		`catalog: ${CatalogResult.OutputPath} (${CatalogResult.Entries} entries, ${CatalogResult.Bytes}B)`,
	);
	Log(`done in ${Elapsed}ms`);

	return {
		RecordsEmitted: Records.length,
		CatalogPath: CatalogResult.OutputPath,
		Failures,
		DurationMilliseconds: Elapsed,
	};
};

export default RunCodegen;
