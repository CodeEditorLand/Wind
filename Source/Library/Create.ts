/**
 * @module Create
 *
 */
export default (async (
	...[[Store, [Item, _Item]], Value = null]: Parameters<Interface>
) => {
	let Existing = get(Store);

	try {
		Existing = (
			await import("@codeeditorland/common/Target/Function/Get.js")
		).default(JSON.parse(get(Store)));
	} catch (_Error) {
		console.log(_Error);
	}

	_Item(Value ?? Existing);

	return [Item, _Item];
}) satisfies Interface as Interface;

import type Interface from "../Interface/Create.js";

export const { get } = await import("store");
