// Application/Dialog/Tag.ts
// Purpose: Defines the Effect Context Tag for IFileDialogService.

import { Context } from "effect";
import type { IFileDialogService as VsCodeFileDialogServiceInterface } from "vs/platform/dialogs/common/dialogs";

/**
 * @module Tag (Service Tag for FileDialog)
 * @description Represents the `IFileDialogService` interface from VSCode.
 */
export type Interface = VsCodeFileDialogServiceInterface;

/**
 * @description The `effect-ts` `Context.Tag` for the `IFileDialogService`.
 * `Context.GenericTag<Identifier, Service>(key)` is used.
 * `Interface` (IFileDialogService) is used as both Identifier and Service type.
 * "vscode/FileDialogService" is the runtime key.
 */
const DialogServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/FileDialogService",
);

// Type: Tag<Interface, Interface>

export default DialogServiceTag;
