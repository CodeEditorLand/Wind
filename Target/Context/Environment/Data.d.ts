import type { _Function } from "@Library/Environment";
import type { Signal } from "solid-js";
import type { z } from "zod";
export type Type = Signal<z.infer<Exclude<typeof _Function, boolean>>>;
declare const _default: [import("solid-js").Accessor<unknown>, import("solid-js").Setter<unknown>];
export default _default;
