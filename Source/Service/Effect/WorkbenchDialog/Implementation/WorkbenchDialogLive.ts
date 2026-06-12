import type {
	WorkbenchDialogConfirmOptions,
	WorkbenchDialogConfirmResult,
	WorkbenchDialogPickOptions,
	WorkbenchDialogService,
} from "../Interface/WorkbenchDialogService.js";
import { WorkbenchDialogError } from "../Type/WorkbenchDialogProblem.js";
import type {
	WorkbenchDialogBridgeShape,
	WorkbenchDialogGlobals,
} from "./WorkbenchDialogBridgeShape.js";

const Unavailable = (): WorkbenchDialogError =>
	new WorkbenchDialogError({
		_tag: "WorkbenchDialogBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Dialog is null - the workbench has not yet exposed its IDialogService handle.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const Failed = (Cause: unknown): WorkbenchDialogError =>
	new WorkbenchDialogError({
		_tag: "WorkbenchDialogFailed",
		error: ToError(Cause),
	});

function makeWorkbenchDialogService(): WorkbenchDialogService {
	const getBridge = (): WorkbenchDialogBridgeShape | null =>
		(globalThis as unknown as WorkbenchDialogGlobals).__CEL_SERVICES__
			?.Dialog ?? null;

	const Confirm = async (
		Options: WorkbenchDialogConfirmOptions,
	): Promise<WorkbenchDialogConfirmResult> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			return await Bridge.confirm({
				message: Options.message,
				...(Options.detail !== undefined
					? { detail: Options.detail }
					: {}),
				...(Options.primaryButton !== undefined
					? { primaryButton: Options.primaryButton }
					: {}),
				...(Options.cancelButton !== undefined
					? { cancelButton: Options.cancelButton }
					: {}),
				...(Options.type !== undefined ? { type: Options.type } : {}),
			});
		} catch (Cause) {
			throw Failed(Cause);
		}
	};

	const Pick = async (
		Options: WorkbenchDialogPickOptions,
	): Promise<number> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Buttons = Options.choices.map((Label) => ({
			label: Label,
		}));

		let Result: Awaited<ReturnType<typeof Bridge.prompt>>;

		try {
			Result = await Bridge.prompt({
				message: Options.message,
				...(Options.detail !== undefined
					? { detail: Options.detail }
					: {}),
				buttons: Buttons,
				...(Options.cancelId !== undefined
					? {
							cancelButton: {
								label: Options.choices[Options.cancelId] ?? "",
							},
						}
					: {}),
			});
		} catch (Cause) {
			throw Failed(Cause);
		}

		const Index = Options.choices.findIndex(
			(_, idx) => Result.result === Buttons[idx],
		);

		return Index < 0 ? 0 : Index;
	};

	const Info = async (Message: string, Detail?: string): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.info(Message, Detail);
		} catch (Cause) {
			throw Failed(Cause);
		}
	};

	const ErrorVariant = async (
		Message: string,

		Detail?: string,
	): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.error(Message, Detail);
		} catch (Cause) {
			throw Failed(Cause);
		}
	};

	const Service: WorkbenchDialogService = {
		Confirm,

		Pick,

		Info,

		Error: ErrorVariant,
	};

	return Service;
}

export const WorkbenchDialogLive = makeWorkbenchDialogService();

export default WorkbenchDialogLive;
