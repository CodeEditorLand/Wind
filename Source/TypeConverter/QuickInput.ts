/**
 * @module QuickInput (TypeConverter)
 * @description Type converters for the QuickInput APIs (`showQuickPick`, `showInputBox`).
 */

import type {
	IInputOptions,
	IPickOptions,
	IQuickPickItem,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/quickinput/common/quickInput.js";

/**
 * The Data Transfer Object for a `IQuickPickItem`.
 */
export interface QuickPickItemDTO {
	readonly label: string;
	readonly description?: string;
	readonly detail?: string;
	readonly picked?: boolean;
	readonly alwaysShow?: boolean;
}

/**
 * The Data Transfer Object for `IPickOptions`.
 */
export interface QuickPickOptionsDTO {
	readonly canPickMany?: boolean;
	readonly placeHolder?: string;
	readonly matchOnDescription?: boolean;
	readonly matchOnDetail?: boolean;
	readonly title?: string;
}

/**
 * The Data Transfer Object for `IInputOptions`.
 */
export interface InputBoxOptionsDTO {
	readonly placeHolder?: string;
	readonly prompt?: string;
	readonly value?: string;
	readonly password?: boolean;
	readonly title?: string;
}

/**
 * Serializes `IQuickPickItem` and `IPickOptions` into a combined DTO for IPC.
 */
export const ToDTO = <T extends IQuickPickItem>(
	Items: readonly T[],
	Options: IPickOptions<T>,
): {
	Items: QuickPickItemDTO[];
	Options: QuickPickOptionsDTO;
} => ({
	Items: Items.map((Item) => ({
		label: Item.label,
		description: Item.description,
		detail: Item.detail,
		picked: Item.picked,
		alwaysShow: Item.alwaysShow,
	})),
	Options: {
		canPickMany: Options.canPickMany,
		placeHolder: Options.placeHolder,
		matchOnDescription: Options.matchOnDescription,
		matchOnDetail: Options.matchOnDetail,
		title: Options.title,
	},
});

/**
 * Serializes `IInputOptions` into a DTO for IPC.
 */
export const ToDTOFromInput = (Options: IInputOptions): InputBoxOptionsDTO => ({
	placeHolder: Options.placeHolder,
	prompt: Options.prompt,
	value: Options.value,
	password: Options.password,
	title: Options.title,
});
