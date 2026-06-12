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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { NotificationService } from "./Interface/NotificationService.js";
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
		Show: async (message, severity, actions) => {
			try {
				const Result = await IPCService.invoke(Channel.NotificationShow)([
					message,
					severity,
					actions ?? [],
				]);
				return typeof Result === "string" ? Result : undefined;
			} catch (error) {
				throw MakeNotificationProblem(error);
			}
		},

		ShowProgress: async (title, cancellable) => {
			try {
				const Result = await IPCService.invoke(Channel.NotificationShowProgress)([
					title,
					cancellable,
				]);
				return typeof Result === "string"
					? Result
					: `progress-${Date.now()}`;
			} catch (error) {
				throw MakeNotificationProblem(error);
			}
		},

		UpdateProgress: async (id, increment, message) => {
			try {
				await IPCService.invoke(Channel.NotificationUpdateProgress)([
					id,
					increment,
					message ?? "",
				]);
			} catch (error) {
				throw MakeNotificationProblem(error);
			}
		},

		EndProgress: async (id) => {
			try {
				await IPCService.invoke(Channel.NotificationEndProgress)([id]);
			} catch (error) {
				throw MakeNotificationProblem(error);
			}
		},
	};

	return Service;
}

export const LiveNotificationService = makeNotificationService();

export default LiveNotificationService;
