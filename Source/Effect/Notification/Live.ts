/**
 * @module Effect/Notification/Live
 * @description
 * Live implementation of NotificationService backed by Mountain's
 * UserInterfaceProvider via Tauri IPC. Shows toast messages and progress
 * indicators that Sky renders in the notification area.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   notification:show            → sky://ui/show-message-request (Mountain emits)
 *   notification:showProgress    → sky://ui/show-progress-begin
 *   notification:updateProgress  → sky://ui/show-progress-update
 *   notification:endProgress     → sky://ui/show-progress-end
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { NotificationService } from "./Interface/NotificationService.js";
import { NotificationServiceTag } from "./Tag/NotificationServiceTag.js";
import type { NotificationProblem } from "./Type/NotificationProblem.js";

const MakeNotificationProblem = (error: unknown): NotificationProblem =>
	error instanceof Error
		? { _tag: "NotificationOperationFailed", error }
		: {
				_tag: "NotificationOperationFailed",

				error: new Error(String(error)),
			};

function makeNotificationService(): NotificationService {
	const IPCService = TauriIPCLive;

	const Service: NotificationService = {
		Show: (message, severity, actions) =>
			IPCService.invoke(Channel.NotificationShow)([
				message,

				severity,

				actions ?? [],
			]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : undefined,
				),

				Effect.mapError(MakeNotificationProblem),
			),

		ShowProgress: (title, cancellable) =>
			IPCService.invoke(Channel.NotificationShowProgress)([
				title,

				cancellable,
			]).pipe(
				Effect.map((Result) =>
					typeof Result === "string"
						? Result
						: `progress-${Date.now()}`,
				),

				Effect.mapError(MakeNotificationProblem),
			),

		UpdateProgress: (id, increment, message) =>
			IPCService.invoke(Channel.NotificationUpdateProgress)([
				id,

				increment,

				message ?? "",
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeNotificationProblem),
			),

		EndProgress: (id) =>
			IPCService.invoke(Channel.NotificationEndProgress)([id]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeNotificationProblem),
			),
	};

	return Service;
}

export const LiveNotificationServiceLayer = Layer.succeed(
	NotificationServiceTag,

	makeNotificationService(),
);

export default LiveNotificationServiceLayer;
