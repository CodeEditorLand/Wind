/**
 * @module Service (Application/Notification)
 * @description Defines the service for showing user-facing notifications, conforming
 * to the `INotificationService` contract from VS Code.
 */

import { Effect } from "effect";
import { ICommandService } from "vs/platform/commands/common/commands.js";
import { IDialogService } from "vs/platform/dialogs/common/dialogs.js";
import type {
	INotification,
	INotificationService,
	IPromptChoice,
	IPromptOptions,
	IStatusMessageOptions,
	NotificationMessage,
	Severity,
} from "vs/platform/notification/common/notification.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { NotificationService as VSCodeNotificationService } from "vs/workbench/services/notification/common/notificationService.js";

import { HostService } from "../Host/Service.js";

/**
 * The `Effect.Service` for the `INotificationService`.
 *
 * This service implementation "lifts" the original `NotificationService` class from
 * VS Code. The lifted class manages the state and lifecycle of notifications (e.g.,
 * handling "Do not show again" logic).
 *
 * We then override the methods responsible for UI display (`notify`, `prompt`, `status`)
 * to delegate the actual rendering of notifications to the `HostService`, which
 * communicates with the native `Mountain` host.
 */
export class NotificationService extends Effect.Service<INotificationService>()(
	"notificationService",
	{
		effect: Effect.gen(function* () {
			// Resolve legacy and modern service dependencies.
			const StorageService = yield* IStorageService;
			const DialogService = yield* IDialogService;
			const CommandService = yield* ICommandService;
			const Host = yield* HostService;

			// Instantiate the real VS Code NotificationService to manage state.
			const ServiceInstance = new VSCodeNotificationService(
				StorageService,
			);

			// Override the UI-displaying methods.
			ServiceInstance.notify = (Notification) => {
				const EffectToRun = Host.ShowNotification(
					Notification as INotification,
				);
				Effect.runFork(EffectToRun);
				// A real implementation would return a handle to manage the notification.
				return {
					onDidClose: new AbortController().signal as any,
					onDidChangeVisibility: new AbortController().signal as any,
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
				Choices: IPromptChoice[],
				Options?: IPromptOptions,
			) => {
				const EffectToRun = Host.ShowPrompt(
					Severity,
					Message,
					Choices,
					Options,
				);
				Effect.runFork(EffectToRun);
				// A real implementation would return a handle.
				return {
					onDidClose: new AbortController().signal as any,
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
				const EffectToRun = Host.ShowStatusMessage(Message, Options);
				Effect.runFork(EffectToRun);
				// A real implementation would return a handle.
				return {
					close: () => {},
				};
			};

			return ServiceInstance;
		}),
	},
) {}
