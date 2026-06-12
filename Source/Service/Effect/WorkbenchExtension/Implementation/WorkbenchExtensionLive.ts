import type {
	WorkbenchExtensionDescriptor,
	WorkbenchExtensionService,
} from "../Interface/WorkbenchExtensionService.js";
import { WorkbenchExtensionError } from "../Type/WorkbenchExtensionProblem.js";
import type {
	UpstreamExtensionDescriptor,
	WorkbenchExtensionBridgeShape,
	WorkbenchExtensionGlobals,
} from "./WorkbenchExtensionBridgeShape.js";

const Unavailable = (): WorkbenchExtensionError =>
	new WorkbenchExtensionError({
		_tag: "WorkbenchExtensionBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Extension is null.",
	});

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

	const Snapshot = (): ReadonlyArray<WorkbenchExtensionDescriptor> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.extensions.map(ToDescriptor);
	};

	const Activate = async (ExtensionId: string): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.activateById(
				{ value: ExtensionId },

				{
					startup: false,
					extensionId: { value: ExtensionId },
				},
			);
		} catch (Cause) {
			throw new WorkbenchExtensionError({
				_tag: "WorkbenchExtensionActivationFailed",
				extensionId: ExtensionId,
				error: ToError(Cause),
			});
		}
	};

	const ActivateByEvent = async (EventName: string): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.activateByEvent(EventName);
		} catch (Cause) {
			throw new WorkbenchExtensionError({
				_tag: "WorkbenchExtensionActivationFailed",
				extensionId: `<event:${EventName}>`,
				error: ToError(Cause),
			});
		}
	};

	const OnExtensionsChange = (
		Callback: (
			extensions: ReadonlyArray<WorkbenchExtensionDescriptor>,
		) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidChangeExtensions(() => {
			Callback(Bridge.extensions.map(ToDescriptor));
		});
	};

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
