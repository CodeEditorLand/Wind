/**
 * @module Range (TypeConverter/Main)
 * @description Converts between `vscode.Range` and its DTO representation (`IRange`).
 */
import type { IRange } from "@codeeditorland/output/vs/editor/common/core/range.js";
import type { Range as VSCodeRange } from "vscode";
/**
 * Converts a `vscode.Range` object into a plain DTO.
 * Note the conversion from 0-based (VS Code API) to 1-based (internal DTO) indexing.
 * @param RangeInstance - The `vscode.Range` instance to convert.
 * @returns The `IRange` DTO.
 */
export declare const FromAPI: (RangeInstance: VSCodeRange) => IRange;
/**
 * Revives a range DTO back into a `vscode.Range` class instance.
 * Note the conversion from 1-based (internal DTO) to 0-based (VS Code API) indexing.
 * @param RangeDTO - The `IRange` DTO to revive.
 * @returns A new `vscode.Range` instance.
 */
export declare const ToAPI: (RangeDTO: IRange) => VSCodeRange;
//# sourceMappingURL=Range.d.ts.map