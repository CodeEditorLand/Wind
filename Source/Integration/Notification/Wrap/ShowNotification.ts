/*
 * File: Wind/Source/Integration/Notification/Wrap/ShowNotification.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:15 UTC
 * Dependency: ../Error.js, effect, vs/platform/notification/common/notification.js
 */

import {
	sendNotification,
	type Options as TauriNotificationOptions,
} from "@tauri-apps/api/notification";
import { Effect } from "effect";
import type { INotification } from "vs/platform/notification/common/notification.js";

import { NotificationProblem } from "../Error.js";

const ConvertToTauriOptions = (
	VsCodeNotification: INotification,
): TauriNotificationOptions => {
	const TitleMap: Record<number, string> = {
		1: "Info",
		2: "Warning",
		3: "Error",
	};

	const Body =
		VsCodeNotification.message instanceof Error
			? VsCodeNotification.message.message
			: VsCodeNotification.message;

	const SourceLabel =
		typeof VsCodeNotification.source === "string"
			? VsCodeNotification.source
			: VsCodeNotification.source?.label;

	const Title = SourceLabel
		? `${SourceLabel} (${TitleMap[VsCodeNotification.severity] ?? "Notification"})`
		: (TitleMap[VsCodeNotification.severity] ?? "Notification");

	return { title: Title, body: Body };
};

const ShowNotification = (
	VsCodeNotification: INotification,
): Effect.Effect<void, NotificationProblem> =>
	Effect.tryPromise({
		try: () => sendNotification(ConvertToTauriOptions(VsCodeNotification)),
		catch: (cause) =>
			new NotificationProblem({
				cause,
				context: "FailedToSendTauriNotification",
			}),
	});

export default ShowNotification;
