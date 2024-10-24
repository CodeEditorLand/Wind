import type Item from "@Context/Store/Item";
import type Into from "@Interface/Create.js";
import type Interface from "@Interface/Items.js";

/**
 * @module Items
 *
 */
export default (await import("solid-js")).createSignal(
	new Map<Into, Item>(),
) satisfies Interface;
