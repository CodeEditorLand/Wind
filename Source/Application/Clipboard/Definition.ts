/**
 * @module Definition (Clipboard)
 * @description The concrete implementation of the IClipboardService interface.
 * It translates the promise-based VS Code API into declarative Effect workflows
 * by wrapping the effects from the Integration layer.
 */

import { Effect, pipe, Runtime } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

/**
 * A helper function to execute an Effect from the Integration layer and return
 * its result as a Promise, bridging the declarative Effect world with the
 * imperative, promise-based VS Code interface.
 *
 * It also maps the low-level Integration error into a domain-specific
 * Application error for better error tracking.
 *
 * @param effect - The Effect to run, which may fail with an IntegrationClipboardProblem.
 * @returns A Promise that resolves with the success value of the Effect.
 */
const RunIntegrationEffect = <A>(
	effect: Effect.Effect<A, IntegrationClipboardProblem>,
): Promise<A> => {
	return pipe(
		effect,

		Effect.mapError((cause) => new ApplicationClipboardProblem({ cause })),

		(finalEffect) =>
			Runtime.runPromise(Runtime.defaultRuntime, finalEffect),
	);
};

class ClipboardServiceImpl implements IClipboardService {
	readonly _serviceBrand: undefined;

	triggerPaste(_targetWindowId: number): Promise<void> | undefined {
		// This is a complex UI interaction that doesn't map well to a simple
		// Tauri invoke call. Stubbing is appropriate for now.
		return undefined;
	}

	writeText(Text: string): Promise<void> {
		return RunIntegrationEffect(WriteText(Text));
	}

	readText(): Promise<string> {
		return RunIntegrationEffect(ReadText);
	}

	readFindText(): Promise<string> {
		// VS Code's find widget has a separate clipboard. We can fallback to the main one.
		return this.readText();
	}

	writeFindText(Text: string): Promise<void> {
		return this.writeText(Text);
	}

	writeResources(ResourceList: Uri[]): Promise<void> {
		return RunIntegrationEffect(WriteResourceList(ResourceList));
	}

	readResources(): Promise<Uri[]> {
		return RunIntegrationEffect(ReadResourceList);
	}

	hasResources(): Promise<boolean> {
		return RunIntegrationEffect(HasResourceList);
	}

	readImage(): Promise<Uint8Array> {
		return RunIntegrationEffect(ReadImage);
	}
}

/**
 * An Effect that creates an instance of the ClipboardService.
 * This pattern allows for dependency injection if needed in the future.
 */
const Definition = Effect.sync(() => new ClipboardServiceImpl());

export default Definition;
