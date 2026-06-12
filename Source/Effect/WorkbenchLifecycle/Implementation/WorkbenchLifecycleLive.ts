/**
 * Live `WorkbenchLifecycleService`. Bridges VS Code's
 * `ILifecycleService` exposed on `globalThis.__CEL_SERVICES__.
 * Lifecycle`.
 *
 * `Advance` sends a Tauri-IPC `lifecycle:advancePhase` to Mountain
 * (mirroring the imperative call already injected by
 * `InjectEagerLifecyclePhase` and `ExposeWorkbenchAccessor`).
 * Phase reads + waits go through the workbench bridge.
 */

import type {
	WorkbenchLifecyclePhaseChange,
	WorkbenchLifecycleService,
} from "../Interface/WorkbenchLifecycleService.js";

import {
	WorkbenchLifecycleError,
	type WorkbenchLifecyclePhase,
} from "../Type/WorkbenchLifecycleProblem.js";

import {
	type WorkbenchLifecycleBridgeShape,
	type WorkbenchLifecycleGlobals,
	WorkbenchLifecyclePhaseCode,
	WorkbenchLifecyclePhaseFromCode,
} from "./WorkbenchLifecycleBridgeShape.js";

const Unavailable = (): WorkbenchLifecycleError =>
	new WorkbenchLifecycleError({
		_tag: "WorkbenchLifecycleBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Lifecycle is null - the workbench has not yet exposed its ILifecycleService handle.",
	});

interface TauriBridge {
	readonly invoke: (
		command: string,

		args?: Record<string, unknown>,
	) => Promise<unknown>;
}

interface TauriGlobal {
	readonly __TAURI__?: {
		readonly invoke?: TauriBridge["invoke"];

		readonly core?: { readonly invoke?: TauriBridge["invoke"] };
	};

	readonly __TAURI_INTERNALS__?: { readonly invoke?: TauriBridge["invoke"] };
}

const ResolveTauriInvoke = (): TauriBridge["invoke"] | null => {
	const G = globalThis as unknown as TauriGlobal;

	return (
		G.__TAURI_INTERNALS__?.invoke ??
		G.__TAURI__?.core?.invoke ??
		G.__TAURI__?.invoke ??
		null
	);
};

function makeWorkbenchLifecycleService(): WorkbenchLifecycleService {
	const getBridge = (): WorkbenchLifecycleBridgeShape | null =>
		(globalThis as unknown as WorkbenchLifecycleGlobals).__CEL_SERVICES__
			?.Lifecycle ?? null;

	const Current = (): WorkbenchLifecyclePhase => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return WorkbenchLifecyclePhaseFromCode(Bridge.phase);
	};

	const Advance = async (Phase: WorkbenchLifecyclePhase): Promise<void> => {
		const Invoke = ResolveTauriInvoke();

		if (!Invoke) throw Unavailable();

		try {
			await Invoke("MountainIPCInvoke", {
				method: "lifecycle:advancePhase",
				params: [WorkbenchLifecyclePhaseCode(Phase)],
			});
		} catch {
			const B = getBridge();

			throw new WorkbenchLifecycleError({
				_tag: "WorkbenchLifecyclePhaseRefused",
				attempted: Phase,
				current: B
					? WorkbenchLifecyclePhaseFromCode(B.phase)
					: ("Starting" as const),
			});
		}
	};

	const When = async (Phase: WorkbenchLifecyclePhase): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		await Bridge.when(WorkbenchLifecyclePhaseCode(Phase));
	};

	const Phases = (
		_Callback: (change: WorkbenchLifecyclePhaseChange) => void,
	): { readonly dispose: () => void } => ({
		dispose: () => {},
	});

	const OnWillShutdown = (
		Callback: () => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onWillShutdown(() => Callback());
	};

	const OnDidShutdown = (
		Callback: () => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidShutdown(() => Callback());
	};

	const Service: WorkbenchLifecycleService = {
		Current,

		Advance,

		When,

		Phases,

		OnWillShutdown,

		OnDidShutdown,
	};

	return Service;
}

export const WorkbenchLifecycleLive = makeWorkbenchLifecycleService();

export default WorkbenchLifecycleLive;
