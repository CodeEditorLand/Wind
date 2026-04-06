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

import { IPC } from "../IPC.js";
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

export const LiveNotificationServiceLayer = Layer.effect(
	NotificationServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: NotificationService = {
			Show: (message, severity, actions) =>
				IPCService.invoke("notification:show")([
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
				IPCService.invoke("notification:showProgress")([
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
				IPCService.invoke("notification:updateProgress")([
					id,
					increment,
					message ?? "",
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeNotificationProblem),
				),

			EndProgress: (id) =>
				IPCService.invoke("notification:endProgress")([id]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeNotificationProblem),
				),
		};

		return Service;
	}),
);

export default LiveNotificationServiceLayer;
