/**
 * @module Error (Application/FileSystem)
 * @description Defines domain-specific, tagged errors for filesystem provider
 * operations at the application layer.
 */
declare const FileSystemProblem_base: new <A extends Record<string, any> = {}>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "FileSystemProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs within the `FileSystemService`.
 * This typically wraps an error from the underlying `IntegrationService` call,
 * providing a clear, domain-specific error type.
 */
export declare class FileSystemProblem extends FileSystemProblem_base<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
export {};
