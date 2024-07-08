/**
 * @module Persist
 *
 */
export default <T>([[Item, _Item], Store]: Property<T>): Promise<
	Return<T>
> => {
	(await import("solid-js")).createEffect(
		(await import("solid-js")).on(
			Item,
			async (Item) =>
				Local.set(
					Store,
					JSON.stringify(
						(
							await import(
								"@codeeditorland/common/Target/Function/Put.js"
							)
						).default(Item),
					),
				),
			{
				defer: false,
			},
		),
	);

	return [Store, [Item, _Item]];
};

import type { Signal } from "solid-js";

export const { default: Local } = await import("store");

export type Property<T> = [Signal<T>, string];

export type Return<T> = [string, Signal<T>];
