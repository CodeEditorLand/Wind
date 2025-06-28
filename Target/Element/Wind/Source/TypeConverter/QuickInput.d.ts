/**
 * @module QuickInput (TypeConverter)
 * @description Type converters for the QuickInput APIs (`showQuickPick`, `showInputBox`).
 */
import type { IInputOptions, IPickOptions, IQuickPickItem } from "vs/platform/quickinput/common/quickInput.js";
/**
 * The Data Transfer Object for a `IQuickPickItem`.
 */
interface QuickPickItemDTO {
    readonly label: string;
    readonly description?: string;
    readonly detail?: string;
    readonly picked?: boolean;
    readonly alwaysShow?: boolean;
}
/**
 * The Data Transfer Object for `IPickOptions`.
 */
interface QuickPickOptionsDTO {
    readonly canPickMany?: boolean;
    readonly placeHolder?: string;
    readonly matchOnDescription?: boolean;
    readonly matchOnDetail?: boolean;
    readonly title?: string;
}
/**
 * The Data Transfer Object for `IInputOptions`.
 */
interface InputBoxOptionsDTO {
    readonly placeHolder?: string;
    readonly prompt?: string;
    readonly value?: string;
    readonly password?: boolean;
    readonly title?: string;
}
/**
 * Serializes `IQuickPickItem` and `IPickOptions` into a combined DTO for IPC.
 */
export declare const ToDTO: <T extends IQuickPickItem>(Items: readonly T[], Options: IPickOptions<T>) => {
    Items: QuickPickItemDTO[];
    Options: QuickPickOptionsDTO;
};
/**
 * Serializes `IInputOptions` into a DTO for IPC.
 */
export declare const ToDTOFromInput: (Options: IInputOptions) => InputBoxOptionsDTO;
export {};
