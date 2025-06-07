import { Effect, pipe } from "effect";
import type {
	IPromptChoice,
	IPromptOptions,
	Severity,
} from "vs/platform/notification/common/notification.js";

import {
	RequestConfirmDialog,
	RequestMessageDialog,
} from "../../Integration/Dialog.js"; // Assuming these exist
import { NotificationProblem } from "../Error.js";

interface PromptArgument {
	readonly severity: Severity;
	readonly message: string;
	readonly choices: readonly IPromptChoice[];
	readonly options?: IPromptOptions;
}

const ConvertSeverityToTitle = (severity: Severity): string => {
	switch (severity) {
		case 1 /* Info */:
			return "Information";
		case 2 /* Warning */:
			return "Warning";
		case 3 /* Error */:
			return "Error";
		default:
			return "Notification";
	}
};

const ShowPrompt = (
	Argument: PromptArgument,
): Effect.Effect<void, NotificationProblem, never> => {
	const PrimaryChoices = Argument.choices.filter((choice) => !choice.isSecondary);
	const Title = ConvertSeverityToTitle(Argument.severity);

	if (PrimaryChoices.length === 0) {
		return RequestMessageDialog(Argument.message, {
			title: Title,
			kind: "info",
		});
	}

	if (PrimaryChoices.length === 1) {
		const OkChoice = PrimaryChoices[0];
		return pipe(
			RequestConfirmDialog(Argument.message, {
				title: Title,
				okLabel: OkChoice.label,
			}),
			Effect.if({
				onTrue: Effect.sync(() => OkChoice.run()),
				onFalse: Effect.sync(() => Argument.options?.onCancel?.()),
			}),
		);
	}

	// For >1 primary choices, we use a message dialog and can't handle the actions natively.
	// A custom HTML dialog would be required for full support.
	return RequestMessageDialog(Argument.message, { title: Title, kind: "info" });
};

export default ShowPrompt;
