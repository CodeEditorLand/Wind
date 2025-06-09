/*
 * File: Wind/Source/Application/Clipboard/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:49 UTC
 * Dependency: ./Error.js, effect, vs/platform/clipboard/common/clipboardService.js, vs/platform/uri/common/uri.js
 */

import { Effect, Runtime } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";
import type { Uri } from "vs/platform/uri/common/uri.js";
import {
	ReadText,
	WriteText,
	ReadResourceList,
	WriteResourceList,
	HasResourceList,
	ReadImage,
} from "../../Integration/Clipboard.js";
import { ClipboardProblem } from "./Error.js";

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, never>): Promise<A> => {
	return Runtime.runPromise(ServiceRuntime, eff);
};

class TauriClipboardService implements IClipboardService {
	readonly _serviceBrand: undefined;

	triggerPaste(targetWindowId: number): Promise<void> | undefined {
		// This is a complex UI interaction that cannot be easily mapped to a native API.
		// Stubbing this is the correct approach for now.
		return undefined;
	}

	writeText(text: string): Promise<void> {
		return RunEffect(WriteText(text));
	}

	readText(): Promise<string> {
		return RunEffect(ReadText);
	}

	readFindText(): Promise<string> {
		// Tauri does not have a separate find pasteboard; fall back to the main clipboard.
		return this.readText();
	}

	writeFindText(text: string): Promise<void> {
		// Tauri does not have a separate find pasteboard; fall back to the main clipboard.
		return this.writeText(text);
	}

	writeResources(resources: Uri[]): Promise<void> {
		return RunEffect(WriteResourceList(resources));
	}

	readResources(): Promise<Uri[]> {
		return RunEffect(ReadResourceList);
	}

	hasResources(): Promise<boolean> {
		return RunEffect(HasResourceList);
	}

	readImage(): Promise<Uint8Array> {
		return RunEffect(ReadImage);
	}
}

const Definition = new TauriClipboardService();

export default Definition;

import { Effect, Runtime, pipe } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";
import type { Uri } from "vs/platform/uri/common/uri.js";
import {
	ReadText,
	WriteText,
	ReadResourceList,
	WriteResourceList,
	HasResourceList,
	ReadImage,
} from "../../Integration/Clipboard.js";
import { ApplicationClipboardProblem } from "./Error.js";

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, never>): Promise<A> => {
	return pipe(
		eff,
		Effect.mapError(
			(Cause) => new ApplicationClipboardProblem({ cause: Cause as any }),
		),
		(finalEffect) => Runtime.runPromise(ServiceRuntime, finalEffect),
	);
};

class TauriClipboardService implements IClipboardService {
	readonly _serviceBrand: undefined;

	triggerPaste(targetWindowId: number): Promise<void> | undefined {
		return undefined;
	}

	writeText(Text: string): Promise<void> {
		return RunEffect(WriteText(Text));
	}

	readText(): Promise<string> {
		return RunEffect(ReadText);
	}

	readFindText(): Promise<string> {
		return this.readText();
	}

	writeFindText(Text: string): Promise<void> {
		return this.writeText(Text);
	}

	writeResources(ResourceList: Uri[]): Promise<void> {
		return RunEffect(WriteResourceList(ResourceList));
	}

	readResources(): Promise<Uri[]> {
		return RunEffect(ReadResourceList);
	}

	hasResources(): Promise<boolean> {
		return RunEffect(HasResourceList);
	}

	readImage(): Promise<Uint8Array> {
		return RunEffect(ReadImage);
	}
}

const Definition = new TauriClipboardService();

export default Definition;
