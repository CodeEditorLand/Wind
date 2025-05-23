import type Editors from "@Interface/Context/Editors.js";
import type { Context } from "solid-js";

/**
 * @module Action
 *
 */
export const _Function = (await import("solid-js"))
	.createContext
	// TODO: UNCOMMENT
	// 	{
	// 	Editors: (await import("@Context/Action/Editors")).default,
	// }
	() satisfies Type;

// biome-ignore lint/correctness/useHookAtTopLevel:
export default (await import("solid-js")).useContext(_Function);

export type Type = Context<{
	Editors: Editors;
}>;
