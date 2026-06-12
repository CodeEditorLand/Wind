import type { TextFileProblem } from "../Type/TextFileProblem.js";

/**
 * TextFile service interface
 * Microsoft VSCode Reference: ITextFileService from vs/workbench/services/textfile/common/textfiles.ts
 */
export interface TextFileService {
	readonly Read: (uri: string) => Promise<string>;

	readonly Write: (
		uri: string,

		content: string,
	) => Promise<void>;

	readonly Save: (uri: string) => Promise<void>;

	readonly SaveAll: () => Promise<void>;

	readonly IsDirty: (uri: string) => Promise<boolean>;

	readonly Revert: (uri: string) => Promise<void>;
}
