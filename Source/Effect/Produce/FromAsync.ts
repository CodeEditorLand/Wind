/*
 * File: Wind/Source/Effect/Produce/FromAsync.ts
 * Responsibility:
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Type.js, effect
 * Export: FromAsync
 */

/**
 * @module FromAsync (Effect/Produce)
 * @description A higher-order function that creates a robust, Effect-returning
 * function from a standard, promise-returning async function.
 */

import { Cause, Effect } from "effect";

import type { AsyncFunction, ErrorProducer } from "./Type.js";

/**
 * A factory that takes a promise-based function and returns a new function
 * that, when called, produces a well-typed `Effect`.
 *
 * This utility is a cornerstone of the Integration layer. It standardizes the
 * process of wrapping "impure" async operations (like Tauri API calls) into
 * "pure" declarative Effects, complete with structured, tagged error handling.
 *
 * @template Argument - The tuple type of the source function's arguments.
 * @template Value - The success value type of the source function's promise.
 * @template ErrorData - The type of the static data to be included in the error.
 * @template ErrorType - The specific tagged error type to be produced on failure.
 *
 * @param Source - The original async function `(...args) => Promise<Value>`.
 * @param CreateProblem - The constructor for the tagged error (e.g., `new MyProblem(...)`).
 * @param StaticData - An object containing static data to be merged into the error on creation.
 *
 * @returns A new function `(...args) => Effect.Effect<Value, ErrorType>`.
 */
export function FromAsync<
	Argument extends any[],
	Value,
	ErrorData extends Record<string, any>,
	ErrorType extends Cause.YieldableError & {
		readonly _tag: string;
		readonly cause: unknown;
	} & ErrorData,
>(
	Source: AsyncFunction<Argument, Value>,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Argument) => Effect.Effect<Value, ErrorType> {
	return (...args: Argument) =>
		Effect.tryPromise({
			try: () => Source(...args),
			catch: (cause) =>
				CreateProblem({ ...StaticData, cause } as {
					readonly cause: unknown;
				} & ErrorData),
		});
}
