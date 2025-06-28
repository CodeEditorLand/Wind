/**
 * @module StatusBar (TypeConverter)
 * @description Type converter for the `vscode.StatusBarItem` API.
 */
import type { StatusBarItem as VSCodeStatusBarItem } from "vscode";
import type { CommandConverter } from "./Command.js";
/**
 * The DTO for a status bar entry sent over IPC.
 */
interface StatusBarEntryDTO {
    readonly id: string;
    readonly name: string | undefined;
    readonly text: string;
    readonly tooltip: string | any | undefined;
    readonly command: any | undefined;
    readonly priority: number | undefined;
    readonly alignment: number;
    readonly backgroundColor: string | undefined;
    readonly color: string | undefined;
    readonly accessibilityInformation: any | undefined;
}
/**
 * Converts a `vscode.StatusBarItem` object into a plain DTO for IPC.
 */
export declare const FromAPI: (From: VSCodeStatusBarItem, EntryId: string, CommandConverterInstance: CommandConverter) => StatusBarEntryDTO;
export {};
