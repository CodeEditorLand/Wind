// Integration/Tauri/Type/Filter.ts
// Purpose: Defines the Tauri-specific DialogFilter type.

import type { DialogFilter as TauriPluginDialogFilterDefinition } from "@tauri-apps/plugin-dialog";

/**
 * @module Filter
 * @description Represents a filter for use in Tauri file dialogs.
 */
type Filter = TauriPluginDialogFilterDefinition;
export default Filter;
