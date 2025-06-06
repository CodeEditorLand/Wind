import { Context, Ref } from "effect";

import type { CommandEffect } from "./Register.js";

export const CommandRegistryRef = Context.GenericTag<
	Ref.Ref<Map<string, CommandEffect<any, any>>>,
	Ref.Ref<Map<string, CommandEffect<any, any>>>
>("@app/CommandRegistryRef");
