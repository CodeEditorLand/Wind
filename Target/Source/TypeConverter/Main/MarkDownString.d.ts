/**
 * @module MarkdownString (TypeConverter/Main)
 * @description Converts between `vscode.MarkdownString` and its DTO representation.
 */
import {
	MarkdownString as VSCodeMarkdownString,
	type IMarkdownString as VSCodeIMarkdownString,
} from "vs/base/common/htmlContent.js";

/**
 * Converts a `vscode.MarkdownString` object into a plain DTO for IPC.
 * @param MarkdownStringInstance - The `vscode.MarkdownString` instance to convert.
 * @returns The `IMarkdownString` DTO.
 */
export declare const FromAPI: (
	MarkdownStringInstance: VSCodeMarkdownString,
) => VSCodeIMarkdownString;
/**
 * Revives a markdown string DTO back into a `vscode.MarkdownString` class instance.
 * @param MarkdownStringDTO - The `IMarkdownString` DTO to revive.
 * @returns A new `vscode.MarkdownString` instance.
 */
export declare const ToAPI: (
	MarkdownStringDTO: VSCodeIMarkdownString,
) => VSCodeMarkdownString;
