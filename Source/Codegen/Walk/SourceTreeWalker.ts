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

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

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

const DefaultIncludeExtensions: ReadonlyArray<string> = [".ts"];

const DefaultExcludeSegments: ReadonlyArray<string> = [
	"node_modules",
	"out",
	"out-build",
	"out-vscode",
	"out-vscode-min",
	"build",
	"test",
	".build",
	".vscode-test",
	"resources",
	"scripts",
	"cli",
	"remote",
];

const HasExcludedSegment = (
	relativePath: string,
	excludes: ReadonlyArray<string>,
): boolean => {
	const Segments = relativePath.split(sep);
	for (const Segment of Segments) {
		if (excludes.includes(Segment)) return true;
	}
	return false;
};

const IsIncluded = (
	name: string,
	extensions: ReadonlyArray<string>,
): boolean => {
	for (const Extension of extensions) {
		if (name.endsWith(Extension)) return true;
	}
	return false;
};

export const WalkSourceTree = async function* (
	options: SourceTreeWalkerOptions,
): AsyncIterableIterator<SourceFile> {
	const Includes =
		options.IncludeExtensions.length === 0
			? DefaultIncludeExtensions
			: options.IncludeExtensions;
	const Excludes =
		options.ExcludeSegments.length === 0
			? DefaultExcludeSegments
			: options.ExcludeSegments;

	const Pending: string[] = [options.Root];
	while (Pending.length > 0) {
		const Current = Pending.pop()!;
		const RelativeFromRoot = relative(options.Root, Current);
		if (
			RelativeFromRoot &&
			HasExcludedSegment(RelativeFromRoot, Excludes)
		) {
			continue;
		}

		const Stat = await stat(Current).catch(() => null);
		if (!Stat) continue;

		if (Stat.isDirectory()) {
			const Entries = await readdir(Current).catch(() => []);
			for (const Entry of Entries) {
				Pending.push(join(Current, Entry));
			}
			continue;
		}

		if (!Stat.isFile()) continue;

		const Name = Current.split(sep).pop() ?? "";
		if (!IsIncluded(Name, Includes)) continue;

		const Contents = await readFile(Current, "utf8");
		const SourcePath = relative(options.Root, Current);
		yield {
			SourcePath,
			AbsolutePath: Current,
			Contents,
		};
	}
};

export default WalkSourceTree;
