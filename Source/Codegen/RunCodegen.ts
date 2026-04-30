/**
 * @module Codegen/RunCodegen
 * @description
 * Top-level orchestrator. Runs the codegen pipeline end-to-end:
 *
 *   1. Walk the VS Code source tree (`Dependency/Microsoft/
 *      Dependency/Editor/src/`) via `WalkSourceTree`.
 *   2. Stream files through `IterateServiceDecorators` to yield
 *      one `ServiceDecoratorRecord` per `createDecorator(...)` site.
 *      Cross-file resolution kicks in when the matching interface
 *      is imported from a sibling file rather than declared inline.
 *   3. For each record, emit `<Wind>/Source/Effect/Generated/
 *      <DecoratorName>/<DecoratorName>Upstream.ts` via
 *      `EmitServiceSchema`.
 *   4. After all schemas land, emit a single
 *      `Effect/Generated/ServiceCatalog.ts` index of every
 *      decorator with metadata.
 *   5. Run `EmitBridgeShapeBatch` over the curated manifest so
 *      every Wind workbench service gets a generated `Pick<…>`
 *      bridge shape grounded in real upstream source.
 *
 * The orchestrator is async-iterator-driven: records are emitted
 * as soon as their source file is parsed, no whole-tree buffering.
 * The catalog + bridge-shape passes hold the records in memory
 * (one row per decorator, ~500 entries - trivial).
 *
 * Invoked by `Wind/Source/prepublishOnly.sh` ahead of the TS
 * compile step so the Wind compile picks up the freshly generated
 * schemas + bridge shapes. The orchestrator never throws - every
 * error path returns a `CodegenProblem` so the caller can surface
 * a clean exit code.
 * @category Orchestration
 */

import { existsSync } from "node:fs";

import type { CodegenProblem } from "./Type/CodegenProblem.js";
import type { CommandRegistrationRecord } from "./Type/CommandRegistrationRecord.js";
import type { ServiceDecoratorRecord } from "./Type/ServiceDecoratorRecord.js";

import { EmitBridgeShapeBatch } from "./Emit/EmitBridgeShapeBatch.js";
import { EmitCommandCatalog } from "./Emit/EmitCommandCatalog.js";
import { EmitServiceCatalog } from "./Emit/EmitServiceCatalog.js";
import { EmitServiceSchema } from "./Emit/EmitServiceSchema.js";
import { IterateCommandRegistrations } from "./Extract/IterateCommandRegistrations.js";
import { IterateServiceDecorators } from "./Extract/IterateServiceDecorators.js";
import { WorkbenchBridgeShapeManifest } from "./Manifest/WorkbenchBridgeShapeManifest.js";
import { WalkSourceTree } from "./Walk/SourceTreeWalker.js";

export interface RunCodegenOptions {
	readonly SourceRoot: string;
	readonly OutputRoot: string;
	readonly Log?: (message: string) => void;
}

export interface RunCodegenSummary {
	readonly RecordsEmitted: number;
	readonly CatalogPath: string;
	readonly BridgeShapesEmitted: number;
	readonly BridgeShapesSkipped: ReadonlyArray<string>;
	readonly CommandCatalogPath: string;
	readonly CommandsEmitted: number;
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
	Log(
		`catalog: ${CatalogResult.OutputPath} (${CatalogResult.Entries} entries, ${CatalogResult.Bytes}B)`,
	);

	const BridgeShapeOutcome = await EmitBridgeShapeBatch({
		Records,
		Manifest: WorkbenchBridgeShapeManifest,
		OutputRoot: options.OutputRoot,
	});
	for (const Failure of BridgeShapeOutcome.Failures) {
		Failures.push(Failure);
	}
	Log(
		`bridge shapes: ${BridgeShapeOutcome.Emitted} emitted, ${BridgeShapeOutcome.Skipped.length} skipped`,
	);

	// Second walk for command-registration extraction. Sharing the
	// first walk would require materialising every record before the
	// service-catalog emit step kicks in - which would defeat the
	// async-iterator memory contract. The walker is fast and stat-
	// only; running it twice is cheaper than buffering all records.
	const CommandFiles = WalkSourceTree({
		Root: options.SourceRoot,
		IncludeExtensions: [".ts"],
		ExcludeSegments: [],
	});
	const CommandRecords:CommandRegistrationRecord[] = [];
	for await (const Record of IterateCommandRegistrations(CommandFiles)) {
		CommandRecords.push(Record);
	}
	Log(`discovered ${CommandRecords.length} command registrations`);

	const CommandCatalogResult = await EmitCommandCatalog({
		Records: CommandRecords,
		OutputRoot: options.OutputRoot,
	});
	if ("_tag" in CommandCatalogResult) {
		Failures.push(CommandCatalogResult);
		return CommandCatalogResult;
	}
	Log(
		`command catalog: ${CommandCatalogResult.OutputPath} (${CommandCatalogResult.Entries} entries, ${CommandCatalogResult.Bytes}B)`,
	);

	const Elapsed = Math.round(performance.now() - Started);
	Log(`done in ${Elapsed}ms`);

	return {
		RecordsEmitted: Records.length,
		CatalogPath: CatalogResult.OutputPath,
		BridgeShapesEmitted: BridgeShapeOutcome.Emitted,
		BridgeShapesSkipped: BridgeShapeOutcome.Skipped,
		CommandCatalogPath: CommandCatalogResult.OutputPath,
		CommandsEmitted: CommandCatalogResult.Entries,
		Failures,
		DurationMilliseconds: Elapsed,
	};
};

export default RunCodegen;
