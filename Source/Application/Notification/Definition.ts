import { Effect } from "effect";
import { Event } from "vs/base/common/event.js";
import {
	NoOpNotification,
	type INotification,
	type INotificationHandle,
	type INotificationService,
	type INotificationSource,
	type INotificationSourceFilter,
	type IPromptChoice,
	type IPromptOptions,
	type IStatusHandle,
	type IStatusMessageOptions,
	type NotificationMessage,
	type NotificationsFilter,
	type Severity,
} from "vs/platform/notification/common/notification.js";

import { ShowNotification } from "../../Integration/Notification.js";
import { ShowPrompt } from "./Orchestrate.js";

class TauriNotificationService implements INotificationService {
	readonly _serviceBrand: undefined;

	// --- Stubbed Properties & Events for Interface Compliance ---
	readonly onDidChangeFilter: Event<void> = Event.None;

	private run<A, E>(eff: Effect.Effect<A, E, never>): Promise<A> {
		return Effect.runPromise(eff);
	}

	// --- Core Implementation ---

	info(message: NotificationMessage | NotificationMessage[]): void {
		const messages = Array.isArray(message) ? message : [message];
		messages.forEach((m) =>
			this.notify({ severity: 1 /* Info */, message: m }),
		);
	}

	warn(message: NotificationMessage | NotificationMessage[]): void {
		const messages = Array.isArray(message) ? message : [message];
		messages.forEach((m) =>
			this.notify({ severity: 2 /* Warning */, message: m }),
		);
	}

	error(message: NotificationMessage | NotificationMessage[]): void {
		const messages = Array.isArray(message) ? message : [message];
		messages.forEach((m) =>
			this.notify({ severity: 3 /* Error */, message: m }),
		);
	}

	notify(notification: INotification): INotificationHandle {
		this.run(ShowNotification(notification)).catch((err) =>
			console.error("Failed to show notification:", err),
		);
		return new NoOpNotification(); // Native notifications are fire-and-forget
	}

	prompt(
		severity: Severity,
		message: string,
		choices: IPromptChoice[],
		options?: IPromptOptions,
	): INotificationHandle {
		this.run(ShowPrompt({ severity, message, choices, options })).catch(
			(err) => console.error("Failed to show prompt:", err),
		);
		return new NoOpNotification();
	}

	// --- Stubbed Methods for Interface Compliance ---

	status(
		message: NotificationMessage,
		options?: IStatusMessageOptions,
	): IStatusHandle {
		console.log("Status Message (Ignored):", message);
		return { close: () => {} };
	}

	setFilter(filter: NotificationsFilter | INotificationSourceFilter): void {
		// Not supported in native implementation
	}

	getFilter(source?: INotificationSource): NotificationsFilter {
		return NotificationsFilter.OFF; // Always OFF
	}

	getFilters(): INotificationSourceFilter[] {
		return [];
	}

	removeFilter(sourceId: string): void {
		// Not supported
	}
}

const Definition = Effect.sync(() => new TauriNotificationService());

export default Definition;
