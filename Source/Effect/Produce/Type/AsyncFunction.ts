// Effect/Produce/Type/AsyncFunction.ts

/**
 * @module AsyncFunction
 * @description Type definition for a generic promise-returning function.
 * Represents a function that takes arguments and returns a Promise.
 * @template ArgumentsTuple - Tuple type of arguments for the promise-returning function.
 * @template ResultValue - Success type of the Promise.
 */
export default interface AsyncFunction<
	ArgumentsTuple extends any[],
	ResultValue,
> {
	(...args: ArgumentsTuple): Promise<ResultValue>;
}
