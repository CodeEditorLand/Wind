/**
 * @module Codegen/Walk/SourceTreeWalker
 * @description
 * Async-iterator over the VS Code TypeScript source tree
 * (`Dependency/Microsoft/Dependency/Editor/src/`). Each yield is a
 * `(SourcePath, Contents)` pair with `SourcePath` rooted at
 * `src/`. Skips test fixtures, node_modules, and the gulp build
 * scripts since none of them carry workbench-tier service
 * decorators.
 *
 * The walker uses Node's async `readdir` so the consumer can
 * pipeline parsing without blocking on filesystem IO. Files are
 * read on-demand inside the iterator body rather than ahead of
 * time so memory usage stays flat at O(one file).
 * @category Walk
 */
export interface SourceFile {
	readonly SourcePath: string;

	readonly AbsolutePath: string;

	readonly Contents: string;
}

export interface SourceTreeWalkerOptions {
	readonly Root: string;

	readonly IncludeExtensions: ReadonlyArray<string>;

	readonly ExcludeSegments: ReadonlyArray<string>;
}

export declare const WalkSourceTree: (
	options: SourceTreeWalkerOptions,
) => AsyncIterableIterator<SourceFile>;

export default WalkSourceTree;

//# sourceMappingURL=SourceTreeWalker.d.ts.map
