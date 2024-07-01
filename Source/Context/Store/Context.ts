import type Items from "../../Interface/Items.js";

import type { Context } from "solid-js";

import { createContext, useContext } from "solid-js";

export type Type = Context<{
	Items: Items;
}>;

export const _Function = createContext({
	Items: (await import("@Context/Store/Items")).default,
}) satisfies Type;

export default useContext(_Function);
