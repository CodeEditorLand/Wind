import type { _Function } from "@Library/Environment";
import type { Signal } from "solid-js";
import type { z } from "zod";
export type Type = Signal<z.infer<Exclude<typeof _Function, boolean>>>;
declare const _default: Promise<import("../../Interface/Create").Return<unknown>>;
export default _default;
