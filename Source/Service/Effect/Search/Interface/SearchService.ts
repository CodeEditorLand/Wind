import type { SearchProblem } from "../Type/SearchProblem.js";

export interface TextSearchOptions {
	readonly pattern: string;

	readonly isRegex?: boolean;

	readonly isCaseSensitive?: boolean;

	readonly isWordMatch?: boolean;

	readonly include?: string | readonly string[];

	readonly exclude?: string | readonly string[];

	readonly maxResults?: number;
}

export interface TextSearchMatch {
	readonly uri: string;

	readonly lineNumber: number;

	readonly preview: string;
}

export interface FileSearchOptions {
	readonly pattern: string;

	readonly maxResults?: number;
}

export interface SearchService {
	readonly FindInFiles: (
		options: TextSearchOptions,
	) => readonly TextSearchMatch[];

	readonly FindFiles: (options: FileSearchOptions) => readonly string[];
}
