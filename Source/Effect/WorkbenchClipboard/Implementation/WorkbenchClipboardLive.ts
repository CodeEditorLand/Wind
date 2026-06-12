import type { WorkbenchClipboardService } from "../Interface/WorkbenchClipboardService.js";
import { WorkbenchClipboardError } from "../Type/WorkbenchClipboardProblem.js";
import type {
	WorkbenchClipboardBridgeShape,
	WorkbenchClipboardGlobals,
} from "./WorkbenchClipboardBridgeShape.js";

const Unavailable = (): WorkbenchClipboardError =>
	new WorkbenchClipboardError({
		_tag: "WorkbenchClipboardBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Clipboard is null.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchClipboardService(): WorkbenchClipboardService {
	const getBridge = (): WorkbenchClipboardBridgeShape | null =>
		(globalThis as unknown as WorkbenchClipboardGlobals).__CEL_SERVICES__
			?.Clipboard ?? null;

	const ReadText = async (): Promise<string> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			return await Bridge.readText();
		} catch (Cause) {
			throw new WorkbenchClipboardError({
				_tag: "WorkbenchClipboardReadFailed",
				error: ToError(Cause),
			});
		}
	};

	const WriteText = async (Value: string): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.writeText(Value);
		} catch (Cause) {
			throw new WorkbenchClipboardError({
				_tag: "WorkbenchClipboardWriteFailed",
				error: ToError(Cause),
			});
		}
	};

	const ReadResources = async (): Promise<ReadonlyArray<string>> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		let Resources: Awaited<ReturnType<typeof Bridge.readResources>>;

		try {
			Resources = await Bridge.readResources();
		} catch (Cause) {
			throw new WorkbenchClipboardError({
				_tag: "WorkbenchClipboardReadFailed",
				error: ToError(Cause),
			});
		}

		return Resources.map((Uri) => Uri.toString());
	};

	const WriteResources = async (
		Uris: ReadonlyArray<string>,
	): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const ToShim = Uris.map(
			(Value) =>
				({ toString: () => Value }) as {
					readonly toString: () => string;
				},
		);

		try {
			await Bridge.writeResources(ToShim);
		} catch (Cause) {
			throw new WorkbenchClipboardError({
				_tag: "WorkbenchClipboardWriteFailed",
				error: ToError(Cause),
			});
		}
	};

	return {
		ReadText,

		WriteText,

		ReadResources,

		WriteResources,
	};
}

export const WorkbenchClipboardLive = makeWorkbenchClipboardService();

export default WorkbenchClipboardLive;
