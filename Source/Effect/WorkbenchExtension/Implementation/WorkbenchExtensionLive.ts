import { Effect, Stream } from "effect";

import type {
	WorkbenchExtensionDescriptor,
	WorkbenchExtensionService,
} from "../Interface/WorkbenchExtensionService.js";
import type { WorkbenchExtensionProblem } from "../Type/WorkbenchExtensionProblem.js";
import type {
	UpstreamExtensionDescriptor,
	WorkbenchExtensionBridgeShape,
	WorkbenchExtensionGlobals,
} from "./WorkbenchExtensionBridgeShape.js";

const Unavailable: WorkbenchExtensionProblem = {
	_tag: "WorkbenchExtensionBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Extension is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToDescriptor = (
	upstream: UpstreamExtensionDescriptor,
): WorkbenchExtensionDescriptor => ({
	identifier: upstream.identifier.value,
	version: upstream.version,
	displayName: upstream.displayName ?? null,
	publisher: upstream.publisher ?? null,
	isBuiltin: upstream.isBuiltin ?? false,
	extensionLocation: upstream.extensionLocation.toString(),
});

function makeWorkbenchExtensionService(): WorkbenchExtensionService {
	const getBridge = (): WorkbenchExtensionBridgeShape | null =>
		(globalThis as unknown as WorkbenchExtensionGlobals).__CEL_SERVICES__
			?.Extension ?? null;

	const Snapshot: Effect.Effect<
		ReadonlyArray<WorkbenchExtensionDescriptor>,
		WorkbenchExtensionProblem
	> = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		return Bridge.extensions.map(ToDescriptor);
	});

	const Activate = (
		ExtensionId: string,
	): Effect.Effect<void, WorkbenchExtensionProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () =>
					Bridge.activateById(
						{ value: ExtensionId },

						{
							startup: false,
							extensionId: { value: ExtensionId },
						},
					),
				catch: (Cause) =>
					({
						_tag: "WorkbenchExtensionActivationFailed",
						extensionId: ExtensionId,
						error: ToError(Cause),
					}) satisfies WorkbenchExtensionProblem,
			});
		});

	const ActivateByEvent = (
		EventName: string,
	): Effect.Effect<void, WorkbenchExtensionProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () => Bridge.activateByEvent(EventName),
				catch: (Cause) =>
					({
						_tag: "WorkbenchExtensionActivationFailed",
						extensionId: `<event:${EventName}>`,
						error: ToError(Cause),
					}) satisfies WorkbenchExtensionProblem,
			});
		});

	const OnExtensionsChange = Stream.async<
		ReadonlyArray<WorkbenchExtensionDescriptor>,
		WorkbenchExtensionProblem
	>((Emit) => {
		const Bridge = getBridge();

		if (!Bridge) {
			Emit.fail(Unavailable);

			return Effect.void;
		}

		const Subscription = Bridge.onDidChangeExtensions(() => {
			Emit.single(Bridge.extensions.map(ToDescriptor));
		});

		return Effect.sync(() => Subscription.dispose());
	});

	const Service: WorkbenchExtensionService = {
		Snapshot,

		Activate,

		ActivateByEvent,

		OnExtensionsChange,
	};

	return Service;
}

export const WorkbenchExtensionLive = makeWorkbenchExtensionService();

export default WorkbenchExtensionLive;
