/**
 * @module Convert
 * @description
 * This module provides type converters for the `vscode.StatusBarItem` API,
 * transforming the `StatusBarItem` state into a serializable DTO for IPC.
 */

import type { IAccessibilityInformation } from "@codeeditorland/output/vs/platform/accessibility/common/accessibility.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import { StatusBarAlignment } from "@codeeditorland/output/vs/workbench/services/statusbar/browser/statusbar.js";
import type { Command, StatusBarItem as VSCodeStatusBarItem } from "vscode";

import {
	MarkdownString,
	ThemeColor,
	type IMarkdownString,
} from "../../Platform/Vscode/Type.js";
import type { CommandDTO, MarshalCommand } from "../Command/Convert.js";
import { FromAPI as ConvertMarkdownString } from "../TypeConverter/Main/MarkdownString.js";

/**
 * The Data Transfer Object for a status bar entry sent over IPC.
 */
export interface StatusBarEntryDTO {
	readonly id: string;
	readonly name: string | undefined;
	readonly text: string;
	readonly tooltip: string | IMarkdownString | undefined;
	readonly command: CommandDTO | undefined;
	readonly priority: number | undefined;
	readonly alignment: number; // 0 for Left, 1 for Right
	readonly backgroundColor: string | undefined;
	readonly color: string | undefined;
	readonly accessibilityInformation: IAccessibilityInformation | undefined;
}

/**
 * Converts a `vscode.StatusBarItem` object into a serializable `StatusBarEntryDTO`.
 * @param From The `StatusBarItem` instance to convert.
 * @param EntryID The unique internal ID for this status bar entry.
 * @param Extension The extension description providing the item.
 * @param CommandMarshaller The marshaller to convert the command.
 * @returns A `StatusBarEntryDTO` for IPC transport.
 */
export const FromAPI = (
	From: VSCodeStatusBarItem,
	EntryID: string,
	CommandMarshaller: MarshalCommand,
): StatusBarEntryDTO => ({
	id: EntryID,
	name: From.name,
	text: From.text,
	tooltip:
		typeof From.tooltip === "string"
			? From.tooltip
			: From.tooltip instanceof MarkdownString
				? ConvertMarkdownString(From.tooltip)
				: undefined,
	command: From.command
		? CommandMarshaller.ToDTO(From.command as Command, [])
		: undefined,
	priority: From.priority,
	alignment: From.alignment === StatusBarAlignment.LEFT ? 0 : 1,
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
