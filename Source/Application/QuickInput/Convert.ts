/**
 * @module Convert
 * @description
 * This module provides type converters for the QuickInput APIs (`showQuickPick`,
 * `showInputBox`), serializing the rich VS Code types into simple DTOs suitable
 * for IPC.
 */

import type {
	IInputOptions,
	IPickOptions,
	IQuickPickItem,
} from "@codeeditorland/output/vs/platform/quickinput/common/quickInput.js";

/**
 * The Data Transfer Object for an `IQuickPickItem`.
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
 * Serializes an array of `IQuickPickItem` and `IPickOptions` into a combined
 * DTO suitable for sending over IPC to the native host.
 *
 * @param Items The array of quick pick items.
 * @param Options The options for the quick pick.
 * @returns A combined DTO containing serialized items and options.
 */
export const ToDTO = <T extends IQuickPickItem>(
	Items: readonly T[],
	Options: IPickOptions<T>,
): {
	readonly Items: QuickPickItemDTO[];
	readonly Options: QuickPickOptionsDTO;
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
 *
 * @param Options The input options to serialize.
 * @returns A DTO representing the input box options.
 */
export const InputToDTO = (Options: IInputOptions): InputBoxOptionsDTO => ({
	placeHolder: Options.placeHolder,
	prompt: Options.prompt,
	value: Options.value,
	password: Options.password,
	title: Options.title,
});
