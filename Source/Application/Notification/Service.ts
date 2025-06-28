/**
 * @module Service (Application/Notification)
 * @description Defines the service for showing user-facing notifications, conforming
 * to the `INotificationService` contract from VS Code.
 */

import { Effect } from "effect";
import { NotificationService as VscNotificationService } from "vs/workbench/services/notification/common/notificationService.js";
import type { INotificationService } from "vs/platform/notification/common/notification.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IDialogService } from "vs/platform/dialogs/common/dialogs.js";
import { ICommandService } from "vs/platform/commands/common/commands.js";
import { HostService } from "Source/Application/Host/Service.js";

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
		effect: Effect.gen(function* (Generator) {
			// Resolve legacy and modern service dependencies.
			const StorageService = yield* Generator(IStorageService);
			const DialogService = yield* Generator(IDialogService);
			const CommandService = yield* Generator(ICommandService);
			const Host = yield* Generator(HostService);

			// Instantiate the real VS Code NotificationService to manage state.
			const ServiceInstance = new VscNotificationService(
				StorageService,
				DialogService,
				CommandService,
			);

			// Override the UI-displaying methods.
			ServiceInstance.notify = (Notification) => {
				const EffectToRun = Host.ShowNotification(Notification);
				Effect.runFork(EffectToRun);
				// A real implementation would return a handle to manage the notification.
				return {
					onDidClose: new AbortController().signal as any,
					onDidChangeVisibility: new AbortController().signal as any,
					progress: {
						infinite: () => {},
						done: () => {},
						total: () => {},
						worked: () => {},
					},
					updateSeverity: () => {},
					updateMessage: () => {},
					updateActions: () => {},
					close: () => {},
				};
			};

			ServiceInstance.prompt = (Severity, Message, Choices, Options) => {
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
					onDidChangeVisibility: new AbortController().signal as any,
					progress: {
						infinite: () => {},
						done: () => {},
						total: () => {},
						worked: () => {},
					},
					updateSeverity: () => {},
					updateMessage: () => {},
					updateActions: () => {},
					close: () => {},
				};
			};

			ServiceInstance.status = (Message, Options) => {
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
