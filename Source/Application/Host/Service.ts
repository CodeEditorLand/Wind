/*
 * File: Wind/Source/Application/Host/Service.ts
 * Role: Defines the interface and Context.Tag for the HostService.
 * Responsibilities:
 *   - Declare the contract for the service that bridges the webview environment
 *     to the native host (`Mountain`).
 */

import { Context, type Effect, type Option } from "effect";
import { type URI, type UriComponents } from "vs/base/common/uri.js";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	INativeOpenDialogOptions,
	INativeSaveDialogOptions,
	ISaveDialogResult,
} from "vs/platform/dialogs/common/dialogs.js";

import type { HostServiceProblem } from "./Error/mod.js";

/**
 * The `HostService` is the primary bridge between the Wind application and the
 * native `Mountain` host. It encapsulates all direct communication (IPC) and
 * provides a clean, Effect-native interface for other services to use.
 */
export interface Interface {
	/**
	 * The resolved sandbox configuration received from the host upon startup.
	 */
	readonly configuration: ISandboxConfiguration;

	/**
	 * An Effect that performs the side-effect of attaching the `window.vscode`
	 * global object. This MUST be run before the workbench is instantiated.
	 */
	readonly provideGlobals: () => Effect.Effect<
		void,
		never,
		HostServiceProblem
	>;

	/**
	 * Notifies the native host that the workbench is ready and operational.
	 */
	readonly notifyReady: () => Effect.Effect<void, never, HostServiceProblem>;

	/**
	 * Shows a native dialog for opening files or folders.
	 */
	readonly showOpenDialog: (
		options: INativeOpenDialogOptions,
	) => Effect.Effect<
		Option.Option<readonly URI[]>,
		never,
		HostServiceProblem
	>;

	/**
	 * Shows a native dialog for saving a file.
	 */
	readonly showSaveDialog: (
		options: INativeSaveDialogOptions,
	) => Effect.Effect<Option.Option<URI>, never, HostServiceProblem>;

	/**
	 * Shows a native confirmation dialog for saving dirty files.
	 */
	readonly showSaveConfirm: (
		files: UriComponents[],
	) => Effect.Effect<ISaveDialogResult, never, HostServiceProblem>;

	/**
	 * Requests that the host open a file.
	 */
	readonly openFile: (
		uri: URI,
	) => Effect.Effect<void, never, HostServiceProblem>;
}

export const Tag = Context.Tag<Interface>("wind/HostService");
