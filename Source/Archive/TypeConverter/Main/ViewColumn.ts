/**
 * @module ViewColumn (TypeConverter/Main)
 * @description Converts the `vscode.ViewColumn` enum to its internal DTO
 * representation, which is a numeric editor group identifier.
 */

import { ViewColumn as VSCodeViewColumn } from "vscode";

// These constants are lifted from VS Code's internal API and represent
// special editor group identifiers.
const ActiveEditorGroup = -1;
const SideGroup = -2;
type EditorGroup = number;

/**
 * Converts a public `vscode.ViewColumn` enum value into its internal numeric
 * representation used for IPC and core logic.
 *
 * @param ViewColumn - The `vscode.ViewColumn` enum value from the public API.
 * @returns The corresponding internal `EditorGroup` number, or `undefined` if
 * the input is invalid.
 */
export const FromAPI = (
	ViewColumn?: VSCodeViewColumn,
): EditorGroup | undefined => {
	if (typeof ViewColumn !== "number") {
		return undefined;
	}

	switch (ViewColumn) {
		case VSCodeViewColumn.Active:
			return ActiveEditorGroup;
		case VSCodeViewColumn.Beside:
			return SideGroup;
		default:
			// ViewColumn.One, Two, etc., are 1-based, but the internal representation
			// for specific groups is 0-based.
			if (ViewColumn >= VSCodeViewColumn.One) {
				return ViewColumn - 1;
			}
	}

	return undefined;
};
