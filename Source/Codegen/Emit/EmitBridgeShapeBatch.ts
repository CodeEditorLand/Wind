/**
 * @module Codegen/Emit/EmitBridgeShapeBatch
 * @description
 * Batch helper that takes the full `ServiceDecoratorRecord` set
 * + a manifest of `(decoratorName -> service folder + picked
 * members)` and runs `EmitBridgeShape` for every entry.
 *
 * Manifest is the developer-curated narrowing: each Wind workbench
 * service knows which upstream methods the Live layer consumes.
 * The manifest lives next to this module so it's diff-friendly
 * when Wind starts using a new upstream member.
 * @category Emit
 */

import type { CodegenProblem } from "../Type/CodegenProblem.js";
import type { ServiceDecoratorRecord } from "../Type/ServiceDecoratorRecord.js";

import { EmitBridgeShape } from "./EmitBridgeShape.js";

export interface BridgeShapeManifestEntry {
	readonly DecoratorName: string;
	readonly ServiceFolder: string;
	readonly BridgeFileName?: string;
	readonly PickMembers: ReadonlyArray<string>;
}

export interface EmitBridgeShapeBatchOptions {
	readonly Records: ReadonlyArray<ServiceDecoratorRecord>;
	readonly Manifest: ReadonlyArray<BridgeShapeManifestEntry>;
	readonly OutputRoot: string;
	readonly Log?: (message: string) => void;
}

export interface EmitBridgeShapeBatchSummary {
	readonly Emitted: number;
	readonly Skipped: ReadonlyArray<string>;
	readonly Failures: ReadonlyArray<CodegenProblem>;
}

const DefaultLog = (message: string): void => {
	// eslint-disable-next-line no-console
	console.log(`[Wind/Codegen/BridgeShape] ${message}`);
};

export const EmitBridgeShapeBatch = async (
	options: EmitBridgeShapeBatchOptions,
): Promise<EmitBridgeShapeBatchSummary> => {
	const Log = options.Log ?? DefaultLog;
	const RecordIndex = new Map<string, ServiceDecoratorRecord>();
	for (const Record of options.Records) {
		RecordIndex.set(Record.DecoratorName, Record);
	}

	let Emitted = 0;
	const Skipped: string[] = [];
	const Failures: CodegenProblem[] = [];

	for (const Entry of options.Manifest) {
		const Record = RecordIndex.get(Entry.DecoratorName);
		if (!Record) {
			Skipped.push(Entry.DecoratorName);
			Log(`skipped ${Entry.DecoratorName}: decorator record not found`);
			continue;
		}
		const Outcome = await EmitBridgeShape({
			Record,
			OutputRoot: options.OutputRoot,
			ServiceFolder: Entry.ServiceFolder,
			BridgeFileName: Entry.BridgeFileName,
			PickMembers: Entry.PickMembers,
		});
		if ("_tag" in Outcome) {
			Failures.push(Outcome);
			Log(`failed ${Entry.DecoratorName}: ${Outcome._tag}`);
			continue;
		}
		Emitted += 1;
		Log(
			`emitted ${Outcome.OutputPath} (picked: ${Outcome.PickedMembers.length})`,
		);
	}

	return { Emitted, Skipped, Failures };
};

export default EmitBridgeShapeBatch;
