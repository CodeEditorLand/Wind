// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Context, Layer } from "effect";
// Import the VSCode interface
import { IFileDialogService as VsCodeFileDialogServiceInterface } from "vs/platform/dialogs/common/dialogs";

// Import the service implementation object
import Definition from "./Definition.js";

/**
 * @module Live (Service Layer)
 * @description Tag for the IFileDialogService.
 * This allows IFileDialogService to be used as a dependency in Effect's context system.
 */
// Create an Effect Tag using the VSCode interface.
// The service implementation must match this interface.
export const FileDialogServiceTag =
	Context.Tag<VsCodeFileDialogServiceInterface>("vscode/FileDialogService");
// It's common to export the interface type alongside the tag if not already globally available.
export type FileDialogService = VsCodeFileDialogServiceInterface;

/**
 * @description Provides the live implementation of the IFileDialogService.
 * This layer makes the DialogService (our Definition) available in the Effect context via the FileDialogServiceTag.
 */
const Live = Layer.succeed(
	FileDialogServiceTag, // Use the created Tag
	Definition,
);

export default Live;
