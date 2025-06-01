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
export type Interface = VsCodeFileDialogServiceInterface;

// Ensure the identifier is a string literal.
const Tag = Context.Tag<Interface>("vscode/FileDialogService");

// The type of 'Tag' is now Context.Tag<Interface>

export default Tag;
