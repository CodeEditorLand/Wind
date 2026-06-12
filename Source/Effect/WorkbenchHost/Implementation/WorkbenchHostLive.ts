import type { WorkbenchHostService } from "../Interface/WorkbenchHostService.js";
import { WorkbenchHostError } from "../Type/WorkbenchHostProblem.js";
import type {
	WorkbenchHostBridgeShape,
	WorkbenchHostGlobals,
} from "./WorkbenchHostBridgeShape.js";

const Unavailable = (): WorkbenchHostError =>
	new WorkbenchHostError({
		_tag: "WorkbenchHostBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Host is null.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const Wrap = async <A>(
	Operation: string,

	Run: () => Promise<A>,
): Promise<A> => {
	try {
		return await Run();
	} catch (Cause) {
		throw new WorkbenchHostError({
			_tag: "WorkbenchHostOperationFailed",
			operation: Operation,
			error: ToError(Cause),
		});
	}
};

function makeWorkbenchHostService(): WorkbenchHostService {
	const getBridge = (): WorkbenchHostBridgeShape | null =>
		(globalThis as unknown as WorkbenchHostGlobals).__CEL_SERVICES__
			?.Host ?? null;

	const Reload = async (): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Wrap("reload", () => Bridge.reload());
	};

	const Restart = async (): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Wrap("restart", () => Bridge.restart());
	};

	const Close = async (): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Wrap("close", () => Bridge.close());
	};

	const Focus = async (): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Wrap("focus", () => Bridge.focus());
	};

	const OpenWindow = async (Uris: ReadonlyArray<string>): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Wrap("openWindow", () =>
			Bridge.openWindow(
				Uris.map((Value) => ({
					uri: { toString: () => Value },
				})),
			),
		);
	};

	const OnDidChangeFocus = (
		Callback: (focused: boolean) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge?.onDidChangeFocus) throw Unavailable();

		return Bridge.onDidChangeFocus((Focused) => Callback(Focused));
	};

	const Service: WorkbenchHostService = {
		Reload,

		Restart,

		Close,

		Focus,

		OpenWindow,

		OnDidChangeFocus,
	};

	return Service;
}

export const WorkbenchHostLive = makeWorkbenchHostService();

export default WorkbenchHostLive;
