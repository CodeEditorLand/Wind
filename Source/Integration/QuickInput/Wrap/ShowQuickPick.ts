/*
 * File: Wind/Source/Integration/QuickInput/Wrap/ShowQuickPick.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:14 UTC
 * Dependency: ../Error.js, @tauri-apps/api/tauri, effect, vs/base/common/cancellation.js
 */

import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";
import type { CancellationToken } from "vs/base/common/cancellation.js";
import type {
	IPickOptions,
	IQuickPickItem,
	QuickPickInput,
} from "vs/platform/quickinput/common/quickInput.js";

import { QuickInputProblem } from "../Error.js";

interface SerializedQuickPickItem {
	label: string;
	description?: string;
	detail?: string;
	id?: string;
}

const SerializeItem = (
	Item: QuickPickInput,
): SerializedQuickPickItem | { type: "separator"; label?: string } => {
	if (Item.type === "separator") {
		return { type: "separator", label: Item.label };
	}
	return {
		id: Item.id,
		label: Item.label,
		description: Item.description,
		detail: Item.detail,
	};
};

const ShowQuickPick = <T extends IQuickPickItem>(
	Picks: readonly QuickPickInput<T>[],
	Options?: IPickOptions<T>,
	Token?: CancellationToken,
): Effect.Effect<T[] | T | undefined, QuickInputProblem> =>
	Effect.tryPromise({
		try: async () => {
			const SerializedItems = Picks.map(SerializeItem);
			const SelectedIds = await invoke<string[] | string | null>(
				"mountain_show_quick_pick",
				{
					items: SerializedItems,
					canPickMany: Options?.canPickMany ?? false,
					placeHolder: Options?.placeHolder,
				},
			);

			if (Token?.isCancellationRequested) {
				return undefined;
			}

			if (SelectedIds === null) {
				return undefined;
			}

			const OriginalPicks = Picks.filter(
				(p): p is T => p.type !== "separator",
			);

			if (Array.isArray(SelectedIds)) {
				const idSet = new Set(SelectedIds);
				return OriginalPicks.filter((p) => p.id && idSet.has(p.id));
			} else {
				return OriginalPicks.find((p) => p.id === SelectedIds);
			}
		},
		catch: (cause) =>
			new QuickInputProblem({ cause, context: "FailedToShowQuickPick" }),
	});

export default ShowQuickPick;
