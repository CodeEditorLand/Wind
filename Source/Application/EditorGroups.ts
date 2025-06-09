/*
 * File: Wind/Source/Application/EditorGroups.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:41 UTC
 * Export: default, type Interface
 */

export { default as LiveEditorGroupsService } from "./EditorGroups/Live.js";
export {
	default as EditorGroupsServiceTag,
	type Interface as EditorGroups,
} from "./EditorGroups/Tag.js";
