// Application/Dialog/Tag.ts
// Purpose: Defines the Effect Context Tag for IFileDialogService.

import { Context } from "effect";
// Import the VSCode interface definition
import type { IFileDialogService as VsCodeFileDialogServiceInterface } from "vs/platform/dialogs/common/dialogs";

/**
 * @module Tag (Service Tag for FileDialog)
 * @description Represents the `IFileDialogService` interface from VSCode.
 * This type alias is used for clarity and to type the service implementation.
 */
export type Interface = VsCodeFileDialogServiceInterface;

/**
 * @description The `effect-ts` `Context.Tag` for accessing the `IFileDialogService`.
 * This allows `IFileDialogService` to be injected into and used within `Effect`-managed contexts.
 * The identifier "vscode/FileDialogService" uniquely identifies this service.
 */
const Tag = Context.Tag<"vscode/FileDialogService", Interface>();

export default Tag;
