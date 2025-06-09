/*
 * File: Wind/Source/Application/Dialog/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:03:39 UTC
 * Dependency: ./Error/DialogProblem.js, effect, vs/base/common/uri.js, vs/platform/dialogs/common/dialogs.js
 * Export: Interface
 */

// Source/Application/Dialog/Tag.ts
import { Context, Effect } from "effect";
import { Uri } from "vs/base/common/uri.js";
import type { IFileDialogService } from "vs/platform/dialogs/common/dialogs.js";

import type { DialogProblem } from "./Error/DialogProblem.js";

// We redefine the interface methods to return Effect.
// This makes error types and dependencies explicit.
export interface Interface {
	readonly _serviceBrand: undefined;

	readonly showSaveDialog: (
		Options: VsCodeSaveOptions,
	) => Effect.Effect<Option.Option<Uri>, DialogProblem>;

	readonly showOpenDialog: (
		Options: VsCodeOpenOptions,
	) => Effect.Effect<Uri[] | undefined, DialogProblem>;

	// ... other methods refactored similarly
}

const DialogServiceTag = Context.Tag<Interface>("vscode/FileDialogService");

export default DialogServiceTag;
