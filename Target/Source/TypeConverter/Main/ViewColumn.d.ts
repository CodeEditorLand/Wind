/**
 * @module ViewColumn (TypeConverter/Main)
 * @description Converts the `vscode.ViewColumn` enum to its internal DTO
 * representation, which is a numeric editor group identifier.
 */
import { ViewColumn as VSCodeViewColumn } from "vscode";

type EditorGroup = number;
/**
 * Converts a public `vscode.ViewColumn` enum value into its internal numeric
 * representation used for IPC and core logic.
 *
 * @param ViewColumn - The `vscode.ViewColumn` enum value from the public API.
 * @returns The corresponding internal `EditorGroup` number, or `undefined` if
 * the input is invalid.
 */
export declare const FromAPI: (
	ViewColumn?: VSCodeViewColumn,
) => EditorGroup | undefined;
export {};
