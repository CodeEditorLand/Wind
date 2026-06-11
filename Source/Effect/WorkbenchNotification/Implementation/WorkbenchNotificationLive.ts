import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchNotificationDispatched,
	WorkbenchNotificationOptions,
	WorkbenchNotificationService,
} from "../Interface/WorkbenchNotificationService.js";
import { WorkbenchNotificationServiceTag } from "../Tag/WorkbenchNotificationServiceTag.js";
import type { WorkbenchNotificationProblem } from "../Type/WorkbenchNotificationProblem.js";
import {
	WorkbenchNotificationSeverityCode,
	type WorkbenchNotificationBridgeShape,
	type WorkbenchNotificationGlobals,
} from "./WorkbenchNotificationBridgeShape.js";

const Unavailable: WorkbenchNotificationProblem = {
	_tag: "WorkbenchNotificationBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Notification is null - the workbench has not yet exposed its INotificationService handle.",
};

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
	const Globals = globalThis as unknown as WorkbenchNotificationGlobals;

	const Bridge: WorkbenchNotificationBridgeShape | null =
		Globals.__CEL_SERVICES__?.Notification ?? null;

	const Notify = (
		Options: WorkbenchNotificationOptions,
	): Effect.Effect<void, WorkbenchNotificationProblem> =>
		Effect.gen(function* () {
			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				Bridge.notify({
					severity: WorkbenchNotificationSeverityCode(
						Options.severity,
					),
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
				return yield* Effect.fail<WorkbenchNotificationProblem>({
					_tag: "WorkbenchNotificationDispatchFailed",
					error: ToError(Cause),
				});
			}
		});

	const Info = (Message: string) =>
		Notify({ severity: "Info", message: Message });

	const Warn = (Message: string) =>
		Notify({ severity: "Warning", message: Message });

	const ErrorVariant = (Message: string) =>
		Notify({ severity: "Error", message: Message });

	const OnDispatched = Stream.async<
		WorkbenchNotificationDispatched,
		WorkbenchNotificationProblem
	>((Emit) => {
		const Listener = (Event: Event) => {
			const Detail = (
				Event as CustomEvent<WorkbenchNotificationDispatched>
			).detail;

			Emit.single(Detail);
		};

		try {
			window.addEventListener(NOTIFICATION_EVENT, Listener);
		} catch {
			// no window
		}

		return Effect.sync(() => {
			try {
				window.removeEventListener(NOTIFICATION_EVENT, Listener);
			} catch {
				// no window
			}
		});
	});

	const Service: WorkbenchNotificationService = {
		Notify,

		Info,

		Warn,

		Error: ErrorVariant,

		OnDispatched,
	};

	return Service;
}

export const WorkbenchNotificationLive = Layer.succeed(
	WorkbenchNotificationServiceTag,

	makeWorkbenchNotificationService(),
);

export default WorkbenchNotificationLive;
