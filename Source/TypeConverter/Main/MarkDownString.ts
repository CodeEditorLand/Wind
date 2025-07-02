/**
 * @module MarkdownString (TypeConverter/Main)
 * @description Converts between `vscode.MarkdownString` and its DTO representation.
 */

import {
	MarkdownString as VSCodeMarkdownString,
	type IMarkdownString as VSCodeIMarkdownString,
} from "@codeeditorland/output/vs/base/common/htmlContent.js";
import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import type { Uri as VSCodeURI } from "vscode";

/**
 * Converts a `vscode.MarkdownString` object into a plain DTO for IPC.
 * @param MarkdownStringInstance - The `vscode.MarkdownString` instance to convert.
 * @returns The `IMarkdownString` DTO.
 */
export const FromAPI = (
	MarkdownStringInstance: VSCodeMarkdownString,
): VSCodeIMarkdownString => ({
	value: MarkdownStringInstance.value,
	isTrusted: MarkdownStringInstance.isTrusted,
	baseUri: MarkdownStringInstance.baseUri as unknown as URI | undefined,
	supportThemeIcons: MarkdownStringInstance.supportThemeIcons,
	supportHtml: MarkdownStringInstance.supportHtml,
});

/**
 * Revives a markdown string DTO back into a `vscode.MarkdownString` class instance.
 * @param MarkdownStringDTO - The `IMarkdownString` DTO to revive.
 * @returns A new `vscode.MarkdownString` instance.
 */
export const ToAPI = (
	MarkdownStringDTO: VSCodeIMarkdownString,
): VSCodeMarkdownString => {
	const Result = new VSCodeMarkdownString(
		MarkdownStringDTO.value,
		MarkdownStringDTO.isTrusted
			? {
					enabledCommands: Array.isArray(
						(MarkdownStringDTO.isTrusted as any).enabledCommands,
					)
						? (MarkdownStringDTO.isTrusted as any).enabledCommands
						: undefined,
				}
			: false,
	);

	if (MarkdownStringDTO.baseUri) {
		Result.baseUri = MarkdownStringDTO.baseUri as unknown as VSCodeURI;
	}
	if (MarkdownStringDTO.supportHtml) {
		Result.supportHtml = MarkdownStringDTO.supportHtml;
	}
	return Result;
};
