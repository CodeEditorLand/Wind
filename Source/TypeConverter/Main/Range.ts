/**
 * @module Range (TypeConverter/Main)
 * @description Converts between `vscode.Range` and its DTO representation (`IRange`).
 */

import type { IRange } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/editor/common/core/range.js";
import type { Range as VSCodeRange } from "vscode";

import { Position, Range } from "../../Platform/VSCode/Type.js";

/**
 * Converts a `vscode.Range` object into a plain DTO.
 * Note the conversion from 0-based (VS Code API) to 1-based (internal DTO) indexing.
 * @param RangeInstance - The `vscode.Range` instance to convert.
 * @returns The `IRange` DTO.
 */
export const FromAPI = (RangeInstance: VSCodeRange): IRange => ({
	startLineNumber: RangeInstance.start.line + 1,
	startColumn: RangeInstance.start.character + 1,
	endLineNumber: RangeInstance.end.line + 1,
	endColumn: RangeInstance.end.character + 1,
});

/**
 * Revives a range DTO back into a `vscode.Range` class instance.
 * Note the conversion from 1-based (internal DTO) to 0-based (VS Code API) indexing.
 * @param RangeDTO - The `IRange` DTO to revive.
 * @returns A new `vscode.Range` instance.
 */
export const ToAPI = (RangeDTO: IRange): VSCodeRange =>
	new Range(
		new Position(RangeDTO.startLineNumber - 1, RangeDTO.startColumn - 1),
		new Position(RangeDTO.endLineNumber - 1, RangeDTO.endColumn - 1),
	);
