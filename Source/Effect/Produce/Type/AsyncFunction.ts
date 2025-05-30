// Effect/Produce/Type/AsyncFunction.ts

/**
 * @module AsyncFunction
 * @description Represents a function that returns a Promise.
 * @template ArgumentsTuple - Tuple for function arguments.
 * @template ResultValue - Success type of the Promise.
 */
export default interface AsyncFunction<
	ArgumentsTuple extends any[],
	ResultValue,
> {
	(...args: ArgumentsTuple): Promise<ResultValue>;
}
