import { Effect, Runtime } from "effect";
import type { INativeHostService } from "vs/platform/native/common/native.js";

import {
	FocusWindow,
	OpenWindow,
	Quit,
	Relaunch,
	ShowMessageBox,
	// ... many more effects
} from "../../Integration/Host.js";
import type { HostProblem } from "./Error.js";

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, never>): Promise<A> => {
	return Runtime.runPromise(ServiceRuntime, eff);
};

class TauriNativeHostService implements INativeHostService {
	readonly _serviceBrand: undefined;
	readonly windowId: number;

	// Events would be wired up to Tauri's event listeners
	readonly onDidOpenMainWindow = new (class Emitter<T> {
		event = () => ({ dispose: () => {} });
	})().event;
	// ... other events stubbed ...

	constructor() {
		// The windowId would be fetched from the backend upon initialization
		this.windowId = 1; // Placeholder
	}

	// --- Window ---
	openWindow(arg1?: any, arg2?: any): Promise<void> {
		const toOpen = Array.isArray(arg1) ? arg1 : [];
		const options = Array.isArray(arg1) ? arg2 : arg1;
		return RunEffect(OpenWindow(toOpen, options));
	}

	focusWindow(options?: any): Promise<void> {
		return RunEffect(FocusWindow(options));
	}

	// --- Dialogs ---
	showMessageBox(options: any): Promise<any> {
		return RunEffect(ShowMessageBox(options));
	}

	// --- Lifecycle ---
	relaunch(options?: any): Promise<void> {
		return RunEffect(Relaunch(options));
	}

	quit(): Promise<void> {
		return RunEffect(Quit);
	}

	// --- Other INativeHostService methods would be implemented here ---
	// Each one calling its own specific Effect from Integration/Host
	// For brevity, they are omitted but would follow the same pattern.
}

const Definition = new TauriNativeHostService();

export default Definition;
