/**
 * @module Service (Application/Notification)
 * @description Defines the service for showing user-facing notifications, conforming
 * to the `INotificationService` contract from VS Code.
 */
import { Effect } from "effect";

declare const NotificationService_base: Effect.Service.Class<
	INotificationService,
	"notificationService",
	{
		readonly effect: Effect.Effect<any, unknown, unknown>;
	}
>;
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
export declare class NotificationService extends NotificationService_base {}
export {};
