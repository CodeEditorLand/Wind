

/**
 * @module Service (File)
 * @description Defines the interface and Context.Tag for the File service.
 */

import { Context } from "effect";
import type { IFileService } from "vs/platform/files/common/files.js";

/**
 * The service interface for the File service.
 * This is an alias for VS Code's `IFileService`.
 */
export type Interface = IFileService;

/**
 * The Context.Tag for the File service.
 */
export const Tag = Context.Tag<Interface>("vscode/FileService");
