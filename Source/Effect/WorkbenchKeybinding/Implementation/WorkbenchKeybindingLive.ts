import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchKeybindingDispatch,
	WorkbenchKeybindingResolution,
	WorkbenchKeybindingService,
} from "../Interface/WorkbenchKeybindingService.js";
import { WorkbenchKeybindingServiceTag } from "../Tag/WorkbenchKeybindingServiceTag.js";
import type { WorkbenchKeybindingProblem } from "../Type/WorkbenchKeybindingProblem.js";
import type {
	UpstreamResolvedKeybinding,
	WorkbenchKeybindingBridgeShape,
	WorkbenchKeybindingGlobals,
} from "./WorkbenchKeybindingBridgeShape.js";

const Unavailable: WorkbenchKeybindingProblem = {
	_tag: "WorkbenchKeybindingBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Keybinding is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToResolution = (
	binding: UpstreamResolvedKeybinding,

	commandId: string | null,

	args: ReadonlyArray<unknown>,
): WorkbenchKeybindingResolution => ({
	commandId: commandId ?? binding.getCommand?.() ?? null,
	chord: binding.getLabel() ?? "",
	args,
});

const KEYBINDING_DISPATCH_EVENT = "cel:keybinding-dispatched";

function makeWorkbenchKeybindingService(): WorkbenchKeybindingService {
	const getBridge = (): WorkbenchKeybindingBridgeShape | null =>
		(globalThis as unknown as WorkbenchKeybindingGlobals).__CEL_SERVICES__
			?.Keybinding ?? null;

	const Lookup = (
		CommandId: string,
	): Effect.Effect<
		ReadonlyArray<WorkbenchKeybindingResolution>,
		WorkbenchKeybindingProblem
	> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Bindings = Bridge.lookupKeybindings(CommandId);

			return Bindings.map((Binding) =>
				ToResolution(Binding, CommandId, []),
			);
		});

	const Resolve = (
		Event: KeyboardEvent,
	): Effect.Effect<
		WorkbenchKeybindingResolution | null,
		WorkbenchKeybindingProblem
	> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Binding = yield* Effect.try({
				try: () => Bridge.resolveKeyboardEvent(Event),
				catch: (Cause) =>
					({
						_tag: "WorkbenchKeybindingResolveFailed",
						chord: `${Event.code}`,
						error: ToError(Cause),
					}) satisfies WorkbenchKeybindingProblem,
			});

			return Binding ? ToResolution(Binding, null, []) : null;
		});

	const Chords = Stream.async<
		WorkbenchKeybindingDispatch,
		WorkbenchKeybindingProblem
	>((Emit) => {
		const Listener = (Event: Event) => {
			const Detail = (Event as CustomEvent<WorkbenchKeybindingDispatch>)
				.detail;

			Emit.single(Detail);
		};

		try {
			window.addEventListener(KEYBINDING_DISPATCH_EVENT, Listener);
		} catch {
			// no window in tests
		}

		return Effect.sync(() => {
			try {
				window.removeEventListener(
					KEYBINDING_DISPATCH_EVENT,

					Listener,
				);
			} catch {
				// see above
			}
		});
	});

	const Service: WorkbenchKeybindingService = {
		Lookup,

		Resolve,

		Chords,
	};

	return Service;
}

export const WorkbenchKeybindingLive = Layer.succeed(
	WorkbenchKeybindingServiceTag,

	makeWorkbenchKeybindingService(),
);

export default WorkbenchKeybindingLive;
