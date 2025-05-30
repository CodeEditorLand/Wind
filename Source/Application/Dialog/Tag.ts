// Application/Dialog/Tag.ts
// Purpose: Defines the Effect Context Tag for IFileDialogService.

import { Context } from "effect";
// Import the VSCode interface definition
import type { IFileDialogService as VsCodeFileDialogServiceInterface } from "vs/platform/dialogs/common/dialogs";

/**
 * @module Tag (Service Tag)
 * @description Effect Context Tag for IFileDialogService.
 * This allows IFileDialogService to be injected and used within Effect-managed contexts.
 */
// It's good practice to also export the interface type this Tag represents if it's not easily accessible
export type Interface = VsCodeFileDialogServiceInterface;
const Tag = Context.Tag<Interface>("vscode/FileDialogService"); // Using VSCode's internal service ID

export default Tag;
