import type {
	WorkbenchKeybindingDispatch,
	WorkbenchKeybindingResolution,
	WorkbenchKeybindingService,
} from "../Interface/WorkbenchKeybindingService.js";
import { WorkbenchKeybindingError } from "../Type/WorkbenchKeybindingProblem.js";
import type {
	UpstreamResolvedKeybinding,
	WorkbenchKeybindingBridgeShape,
	WorkbenchKeybindingGlobals,
} from "./WorkbenchKeybindingBridgeShape.js";

const Unavailable = (): WorkbenchKeybindingError =>
	new WorkbenchKeybindingError({
		_tag: "WorkbenchKeybindingBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Keybinding is null.",
	});

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
	): ReadonlyArray<WorkbenchKeybindingResolution> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Bindings = Bridge.lookupKeybindings(CommandId);

		return Bindings.map((Binding) => ToResolution(Binding, CommandId, []));
	};

	const Resolve = (
		Event: KeyboardEvent,
	): WorkbenchKeybindingResolution | null => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		let Binding: UpstreamResolvedKeybinding | null | undefined;

		try {
			Binding = Bridge.resolveKeyboardEvent(Event);
		} catch (Cause) {
			throw new WorkbenchKeybindingError({
				_tag: "WorkbenchKeybindingResolveFailed",
				chord: `${Event.code}`,
				error: ToError(Cause),
			});
		}

		return Binding ? ToResolution(Binding, null, []) : null;
	};

	const Chords = (
		Callback: (dispatch: WorkbenchKeybindingDispatch) => void,
	): { readonly dispose: () => void } => {
		const Listener = (Event: Event) => {
			const Detail = (Event as CustomEvent<WorkbenchKeybindingDispatch>)
				.detail;

			Callback(Detail);
		};

		try {
			window.addEventListener(KEYBINDING_DISPATCH_EVENT, Listener);
		} catch {
			// no window in tests
		}

		return {
			dispose: () => {
				try {
					window.removeEventListener(
						KEYBINDING_DISPATCH_EVENT,

						Listener,
					);
				} catch {
					// see above
				}
			},
		};
	};

	const Service: WorkbenchKeybindingService = {
		Lookup,

		Resolve,

		Chords,
	};

	return Service;
}

export const WorkbenchKeybindingLive = makeWorkbenchKeybindingService();

export default WorkbenchKeybindingLive;
