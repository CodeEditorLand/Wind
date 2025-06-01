// Application/Dialog/Utility/PickFileSaveSimplified.ts
import { Effect, Option, type Context } from "effect";
import { localize } from "vs/nls";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	HostServiceTag as ActualHostServiceTag,
	InheritanceProblem,
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
import PerformShowSave from "../Orchestrate/ShowSave.js";
import type { ServiceProblem } from "../Type.js";
import DecideSimplified from "./DecideSimplified.js";

type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

export default function Pick(
	schema: string,

	options: VsCodeSaveOptions,
): Effect.Effect<UriType | undefined, ServiceProblem, HostServiceType> {
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
