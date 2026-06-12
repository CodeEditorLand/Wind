import type {
	WorkbenchNotificationDispatched,
	WorkbenchNotificationOptions,
	WorkbenchNotificationService,
} from "../Interface/WorkbenchNotificationService.js";

import { WorkbenchNotificationError } from "../Type/WorkbenchNotificationProblem.js";

import {
	type WorkbenchNotificationBridgeShape,
	type WorkbenchNotificationGlobals,
	WorkbenchNotificationSeverityCode,
} from "./WorkbenchNotificationBridgeShape.js";

const Unavailable = (): WorkbenchNotificationError =>
	new WorkbenchNotificationError({
		_tag: "WorkbenchNotificationBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Notification is null - the workbench has not yet exposed its INotificationService handle.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const NOTIFICATION_EVENT = "cel:notification-dispatched";

const PublishLocal = (event: WorkbenchNotificationDispatched): void => {
	try {
		window.dispatchEvent(
			new CustomEvent(NOTIFICATION_EVENT, { detail: event }),
		);
	} catch {
		// no window in tests; ignore
	}
};

function makeWorkbenchNotificationService(): WorkbenchNotificationService {
	const getBridge = (): WorkbenchNotificationBridgeShape | null =>
		(globalThis as unknown as WorkbenchNotificationGlobals).__CEL_SERVICES__
			?.Notification ?? null;

	const Notify = (Options: WorkbenchNotificationOptions): void => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			Bridge.notify({
				severity: WorkbenchNotificationSeverityCode(Options.severity),
				message: Options.message,
				...(Options.source !== undefined
					? { source: Options.source }
					: {}),
				...(Options.silent !== undefined
					? { silent: Options.silent }
					: {}),
			});

			PublishLocal({
				severity: Options.severity,
				message: Options.message,
				source: Options.source,
			});
		} catch (Cause) {
			throw new WorkbenchNotificationError({
				_tag: "WorkbenchNotificationDispatchFailed",
				error: ToError(Cause),
			});
		}
	};

	const Info = (Message: string): void =>
		Notify({ severity: "Info", message: Message });

	const Warn = (Message: string): void =>
		Notify({ severity: "Warning", message: Message });

	const ErrorVariant = (Message: string): void =>
		Notify({ severity: "Error", message: Message });

	const OnDispatched = (
		Callback: (event: WorkbenchNotificationDispatched) => void,
	): { readonly dispose: () => void } => {
		const Listener = (Event: Event) => {
			const Detail = (
				Event as CustomEvent<WorkbenchNotificationDispatched>
			).detail;

			Callback(Detail);
		};

		try {
			window.addEventListener(NOTIFICATION_EVENT, Listener);
		} catch {
			// no window
		}

		return {
			dispose: () => {
				try {
					window.removeEventListener(NOTIFICATION_EVENT, Listener);
				} catch {
					// no window
				}
			},
		};
	};

	const Service: WorkbenchNotificationService = {
		Notify,

		Info,

		Warn,

		Error: ErrorVariant,

		OnDispatched,
	};

	return Service;
}

export const WorkbenchNotificationLive = makeWorkbenchNotificationService();

export default WorkbenchNotificationLive;
