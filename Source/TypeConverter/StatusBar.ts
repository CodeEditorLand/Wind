/**
 * @module StatusBar (TypeConverter)
 * @description Type converter for the `vscode.StatusBarItem` API.
 */

import type { Command, StatusBarItem as VSCodeStatusBarItem } from "vscode";

import { MarkdownString, ThemeColor } from "../Platform/VSCode/Type.js";
import type { CommandConverter } from "./Command.js";
import { FromAPI as MarkdownStringFromAPI } from "./Main/MarkdownString.js";

/**
 * The DTO for a status bar entry sent over IPC.
 */
export interface StatusBarEntryDTO {
	readonly id: string;
	readonly name: string | undefined;
	readonly text: string;
	readonly tooltip: string | any | undefined;
	readonly command: any | undefined;
	readonly priority: number | undefined;
	readonly alignment: number; // 0 for Left, 1 for Right
	readonly backgroundColor: string | undefined;
	readonly color: string | undefined;
	readonly accessibilityInformation: any | undefined;
}

/**
 * Converts a `vscode.StatusBarItem` object into a plain DTO for IPC.
 */
export const FromAPI = (
	From: VSCodeStatusBarItem,
	EntryId: string,
	CommandConverterInstance: CommandConverter,
): StatusBarEntryDTO => ({
	id: EntryId,
	name: From.name,
	text: From.text,
	tooltip:
		typeof From.tooltip === "string"
			? From.tooltip
			: From.tooltip instanceof MarkdownString
				? MarkdownStringFromAPI(From.tooltip)
				: undefined,
	command: From.command
		? CommandConverterInstance.ToInternal(From.command as Command, [])
		: undefined,
	priority: From.priority,
	alignment: From.alignment === 1 /* Left */ ? 0 : 1,
	backgroundColor:
		From.backgroundColor instanceof ThemeColor
			? From.backgroundColor.id
			: undefined,
	color:
		typeof From.color === "string"
			? From.color
			: From.color instanceof ThemeColor
				? From.color.id
				: undefined,
	accessibilityInformation: From.accessibilityInformation,
});
