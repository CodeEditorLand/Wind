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

// Correct usage for effect@3.x:
// Context.Tag<ServiceInterface>(IdentifierStringLiteral)
const Tag = Context.Tag<Interface>("vscode/FileDialogService");

// Tag's type is Context.Tag<Interface> which is equivalent to Context.Tag<Interface, Interface>
// The service type can be accessed via Context.Tag.Service<typeof Tag>

export default Tag;
