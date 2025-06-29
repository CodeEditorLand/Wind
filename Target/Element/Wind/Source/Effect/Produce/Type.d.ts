/**
 * @module Type (Effect/Produce)
 * @description Type definitions for the FromAsync helper.
 * This file is a stub created to resolve dependencies.
 */
import { Cause } from "effect";
export type AsyncFunction<Argument extends any[], Value> = (...args: Argument) => Promise<Value>;
export type ErrorProducer<ErrorData extends Record<string, any>, ErrorType extends Cause.YieldableError & {
    readonly _tag: string;
    readonly cause: unknown;
} & ErrorData> = new (properties: {
    readonly cause: unknown;
} & ErrorData) => ErrorType;
