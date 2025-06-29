/**
 * @module MarkdownString (TypeConverter/Main)
 * @description Converts between `vscode.MarkdownString` and its DTO representation.
 */

import type {
	IMarkdownString,
	MarkdownStringTrustedOptions,
} from "vs/base/common/htmlContent.js";
import { URI } from "vs/base/common/uri.js";
import type { Uri as VSCodeUri } from "vscode";

import { MarkdownString } from "../../Platform/VSCode/Type.js";

/**
 * Converts a `vscode.MarkdownString` object into a plain DTO for IPC.
 * @param MarkdownStringInstance - The `vscode.MarkdownString` instance to convert.
 * @returns The `IMarkdownString` DTO.
 */
export const FromAPI = (
	MarkdownStringInstance: MarkdownString,
): IMarkdownString => ({
	value: MarkdownStringInstance.value,
	isTrusted: MarkdownStringInstance.isTrusted,
	baseUri: MarkdownStringInstance.baseUri as URI | undefined,
	supportHtml: MarkdownStringInstance.supportHtml,
});

/**
 * Revives a markdown string DTO back into a `vscode.MarkdownString` class instance.
 * @param MarkdownStringDTO - The `IMarkdownString` DTO to revive.
 * @returns A new `vscode.MarkdownString` instance.
 */
export const ToAPI = (MarkdownStringDTO: IMarkdownString): MarkdownString => {
	const Result = new MarkdownString(
		MarkdownStringDTO.value,
		typeof MarkdownStringDTO.isTrusted === "boolean"
			? MarkdownStringDTO.isTrusted
			: (MarkdownStringDTO.isTrusted as MarkdownStringTrustedOptions),
	);

	if (MarkdownStringDTO.baseUri) {
		Result.baseUri = MarkdownStringDTO.baseUri as unknown as VSCodeUri;
	}
	if (MarkdownStringDTO.supportHtml) {
		Result.supportHtml = MarkdownStringDTO.supportHtml;
	}
	return Result;
};
