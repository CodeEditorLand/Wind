// Integration/Tauri/Type/SaveOption.ts
// Purpose: Defines the Tauri-specific SaveDialogOptions type.

import type { SaveDialogOptions as Definition } from "@tauri-apps/plugin-dialog";

/**
 * @module SaveOption (File name provides context)
 * @description Configuration options for Tauri's save file dialog.
 */
export type Type = Definition;

export type { Type as default };
