// Application/Dialog/Utility/PickFileSaveSimplified.ts
import { Effect, Option } from "effect";
import { localize } from "vs/nls";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	// Import the actual Tag TS6133 if not used for typeof
	HostServiceTag as ActualHostServiceTag,
	InheritanceProblem,
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
import PerformShowSave from "../Orchestrate/ShowSave.js";
import type { ServiceProblem } from "../Type.js";
import DecideSimplified from "./DecideSimplified.js";

export default function Pick(
	schema: string,

	options: VsCodeSaveOptions,
): Effect.Effect<
	UriType | undefined,
	ServiceProblem,
	typeof ActualHostServiceTag.Type
> {
	// Use typeof Tag.Type
	if (!DecideSimplified(schema)) {
		return PerformShowSave({
			...options,

			title: options.title ?? localize("saveAsTitle", "Save As"),
		}).pipe(Effect.map(Option.getOrUndefined));
	}

	return Effect.fail(
		new InheritanceProblem({
			method: "pickFileSaveSimplified_Super",

			cause: "Simplified non-file save not implemented",
		}),
	);
}
