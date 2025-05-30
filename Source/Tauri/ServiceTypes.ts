import type {
	OpenWindowError,
	SuperCallError,
	TauriDialogError,
	TauriPathError,
} from "../Effect/Tauri/CoreTypes.js";

export type DialogOperationError = TauriPathError | TauriDialogError;
export type PickAndOpenServiceError = DialogOperationError | OpenWindowError;
export type FileDialogServiceError = PickAndOpenServiceError | SuperCallError;
