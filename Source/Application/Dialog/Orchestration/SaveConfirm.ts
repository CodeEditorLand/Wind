import { Effect, pipe } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	getFileNamesMessage,
} from "vs/platform/dialogs/common/dialogs.js";

import {
	ShowMessageDialog,
	type DialogProblem,
	type Uri,
} from "../../../Integration/Tauri.js";

const Orchestrate = (
	FileOrResourceList: (string | Uri)[],
): Effect.Effect<ConfirmResult, DialogProblem> => {
	if (FileOrResourceList.length === 0) {
		return Effect.succeed(ConfirmResult.DONT_SAVE);
	}

	const IsSingleFile = FileOrResourceList.length === 1;

	const Message = IsSingleFile
		? localize(
				"saveChangesMessage",
				"Do you want to save the changes you made to {0}?",
				typeof FileOrResourceList[0] === "string"
					? FileOrResourceList[0]
					: FileOrResourceList[0].fsPath,
			)
		: localize(
				"saveChangesMessages",
				"Do you want to save the changes to the following {0} files?",
				FileOrResourceList.length,
			);

	const Detail = IsSingleFile
		? localize(
				"saveChangesDetail",
				"Your changes will be lost if you don't save them.",
			)
		: `${getFileNamesMessage(FileOrResourceList)}\n${localize(
				"saveChangesDetail",
				"Your changes will be lost if you don't save them.",
			)}`;

	// Tauri's `ask` dialog is the closest we have for a confirm/cancel.
	// It returns true for 'ok', false for 'cancel'. We cannot model a three-way
	// choice (Save, Don't Save, Cancel) without a custom HTML dialog.
	// This is a known limitation we must address. For now, we present a
	// simplified dialog. A "warning" type often implies a destructive action.
	return pipe(
		ShowMessageDialog(`${Message}\n\n${Detail}`, {
			title: localize("saveChangesTitle", "Save Changes"),
			kind: "warning",
		}),
		Effect.as(ConfirmResult.CANCEL), // Safest default for a non-implemented 3-way choice
	);
};

export default Orchestrate;
