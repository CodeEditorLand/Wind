/**
 * @module Define
 * @description
 * Defines the service for showing user-facing notifications, conforming
 * to the `INotificationService` contract from VS Code. This service delegates
 * the rendering of notifications to the native host.
 */

import { Emitter } from "@codeeditorland/output/vs/base/common/event.js";
import {
	type INotification,
	type INotificationHandle,
	type INotificationService,
	type IPromptChoice,
	type IPromptChoiceWithMenu,
	type IPromptOptions,
	type IStatusMessageOptions,
	type NotificationMessage,
	type Severity,
} from "@codeeditorland/output/vs/platform/notification/common/notification.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { NotificationService as VSCodeNotificationService } from "@codeeditorland/output/vs/workbench/services/notification/common/notificationService.js";
import { Effect } from "effect";

import { HostService } from "../Host/Define.js";

/**
 * The `Effect.Service` for the `INotificationService`.
 *
 * This service implementation "lifts" the original `NotificationService` class from
 * VS Code. The lifted class manages the state and lifecycle of notifications (e.g.,
 * handling "Do not show again" logic via `IStorageService`).
 *
 * We then override the methods responsible for UI display (`notify`, `prompt`, `status`)
 * to delegate the actual rendering of notifications to the `HostService`, which
 * communicates with the native `Mountain` host.
 *
 * It is registered with the identifier "notificationService" for compatibility.
 */
export class NotificationService extends Effect.Service<INotificationService>()(
	"notificationService",
	{
		effect: Effect.gen(function* (Generator) {
			const StorageService = yield* Generator(IStorageService);
			const Host = yield* Generator(HostService);

			// Instantiate the real VS Code NotificationService to manage state.
			const ServiceInstance = new VSCodeNotificationService(
				StorageService,
			);

			// Override the UI-displaying methods.
			// NOTE: These methods are camelCase to conform to the INotificationService interface.

			ServiceInstance.notify = (Notification): INotificationHandle => {
				const EffectToRun = Host.ShowNotification(
					Notification as INotification,
				);
				Effect.runFork(EffectToRun);

				// A full implementation would return a handle that can be used to
				// manage the notification after it has been shown. For now, we
				// return a handle that performs no operations.
				return {
					onDidClose: new Emitter<void>().event,
					onDidChangeVisibility: new Emitter<boolean>().event,
					progress: {
						infinite: () => {},
						done: () => {},
						total: (_value: number) => {},
						worked: (_value: number) => {},
					},
					updateSeverity: (_severity: Severity) => {},
					updateMessage: (_message: NotificationMessage) => {},
					updateActions: () => {},
					close: () => {},
				};
			};

			ServiceInstance.prompt = (
				Severity: Severity,
				Message: string,
				Choices: (IPromptChoice | IPromptChoiceWithMenu)[],
				Options?: IPromptOptions,
			): INotificationHandle => {
				const EffectToRun = Host.ShowPrompt(
					Severity,
					Message,
					Choices,
					Options,
				);
				Effect.runFork(EffectToRun);

				return {
					onDidClose: new Emitter<void>().event,
					onDidChangeVisibility: new Emitter<boolean>().event,
					progress: {
						infinite: () => {},
						done: () => {},
						total: (_value: number) => {},
						worked: (_value: number) => {},
					},
					updateSeverity: (_severity: Severity) => {},
					updateMessage: (_message: NotificationMessage) => {},
					updateActions: () => {},
					close: () => {},
				};
			};

			ServiceInstance.status = (
				Message: NotificationMessage,
				Options?: IStatusMessageOptions,
			) => {
				// The `status` method on the host is not yet implemented.
				// For now, we can log a warning. A full implementation
				// would call `Host.ShowStatusMessage(Message, Options)`.
				console.warn(
					"IStatusMessageService.status is not implemented.",
				);
				return {
					close: () => {},
				};
			};

			return ServiceInstance;
		}),
	},
) {}
