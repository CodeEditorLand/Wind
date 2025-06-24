/*
 * File: Wind/Source/Application/Clipboard/Definition.ts
 * Role: Provides the concrete implementation of the IClipboardService interface for Wind.
 * Responsibilities:
 *   - Translates the promise-based VS Code API into declarative Effect workflows.
 *   - Wraps clipboard-related effects from the Integration layer (`Tauri` service).
 */

import { Effect, Runtime } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";
import type { Uri } from "Source/Platform/VSCode/Type.js";
import {
	ReadImage,
	ReadResourceList,
	ReadText,
	WriteResourceList,
	WriteText,
	HasResourceList,
} from "Source/Integration/Tauri/Clipboard/Wrapper.js";
import { ApplicationClipboardProblem } from "./Error.js";
import type { IntegrationClipboardProblem } from "Source/Integration/Tauri/Clipboard/Error.js";

/**
 * Higher-order function to execute an `Effect` from the Integration layer and
 * return its result as a `Promise`. This bridges the declarative Effect world
 * with the imperative, promise-based VS Code service interface.
 *
 * @param AppRuntime - The application's `Runtime` to execute the effect.
 * @param IntegrationEffect - The `Effect` to run.
 * @returns A `Promise` that resolves with the success value of the `Effect`.
 */
const RunIntegrationEffect = <SuccessType>(
	AppRuntime: Runtime.Runtime<never>,
	IntegrationEffect: Effect.Effect<SuccessType, IntegrationClipboardProblem>,
): Promise<SuccessType> => {
	const MappedEffect = Effect.mapError(
		IntegrationEffect,
		(Cause) => new ApplicationClipboardProblem({ Cause }),
	);
	return Runtime.runPromise(AppRuntime, MappedEffect);
};

/**
 * The concrete class implementing the `IClipboardService` for the Wind UI.
 */
class ClipboardServiceImpl implements IClipboardService {
	public readonly _serviceBrand: undefined;
	private readonly RunEffect: <A>(
		E: Effect.Effect<A, IntegrationClipboardProblem>,
	) => Promise<A>;

	constructor(AppRuntime: Runtime.Runtime<never>) {
		this.RunEffect = <A>(
			IntegrationEffect: Effect.Effect<A, IntegrationClipboardProblem>,
		) => RunIntegrationEffect(AppRuntime, IntegrationEffect);
	}

	public triggerPaste(_TargetWindowId: number): Promise<void> | undefined {
		// This is a complex UI interaction that doesn't map well to a simple
		// Tauri invoke call. Stubbing is appropriate for now.
		console.warn("IClipboardService.triggerPaste is not implemented.");
		return undefined;
	}

	public writeText(Text: string): Promise<void> {
		return this.RunEffect(WriteText(Text));
	}

	public readText(): Promise<string> {
		return this.RunEffect(ReadText);
	}

	public readFindText(): Promise<string> {
		// VS Code's find widget has a separate clipboard. We can fallback to the main one.
		return this.readText();
	}

	public writeFindText(Text: string): Promise<void> {
		return this.writeText(Text);
	}

	public writeResources(ResourceList: Uri[]): Promise<void> {
		return this.RunEffect(WriteResourceList(ResourceList));
	}

	public readResources(): Promise<Uri[]> {
		return this.RunEffect(ReadResourceList);
	}

	public hasResources(): Promise<boolean> {
		return this.RunEffect(HasResourceList);
	}

	public readImage(): Promise<Uint8Array> {
		return this.RunEffect(ReadImage);
	}
}

/**
 * An `Effect` that builds the live implementation of the `Clipboard` service.
 * It depends on the application `Runtime` to execute the integration effects.
 */
const Definition = Effect.gen(function* (Generator) {
	const AppRuntime = yield* Generator(Effect.runtime<never>());
	return new ClipboardServiceImpl(AppRuntime);
});

export default Definition;
