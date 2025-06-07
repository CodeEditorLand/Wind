// Effect/Produce/Type/AsyncFunction.ts

/**
 * @module AsyncFunction
 * @description Represents a function that returns a Promise.
 * @template ArgumentTuple - Tuple for function arguments.
 * @template ResultValue - Success type of the Promise.
 */
export default interface AsyncFunction<
	ArgumentTuple extends any[],
	ResultValue,
> {
	(...args: ArgumentTuple): Promise<ResultValue>;
}
