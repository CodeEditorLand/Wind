/*
 * File: Wind/Source/Application/Commands/Ref.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:47 UTC
 * Dependency: ./Register.js, effect
 * Export: CommandRegistryRef
 */

import { Context, Ref } from "effect";

import type { CommandEffect } from "./Register.js";

export const CommandRegistryRef = Context.GenericTag<
	Ref.Ref<Map<string, CommandEffect<any, any>>>,
	Ref.Ref<Map<string, CommandEffect<any, any>>>
>("@app/CommandRegistryRef");
