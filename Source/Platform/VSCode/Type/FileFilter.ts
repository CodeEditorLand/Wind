// Platform/VSCode/Type/FileFilter.ts
// Purpose: Defines the VSCode FileFilter type.

import type { FileFilter as VsCodeFileFilterDefinition } from "vs/platform/dialogs/common/dialogs";

/**
 * @module FileFilter
 * @description Interface describing a file filter used in VSCode dialogs,
 * specifying a name and associated extensions.
 */
type FileFilter = VsCodeFileFilterDefinition;
export default FileFilter;
