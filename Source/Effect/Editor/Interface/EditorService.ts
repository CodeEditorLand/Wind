/**
 * Editor service interface
 * Microsoft VSCode Reference: ICodeEditorService from vs/editor/browser/services/codeEditorService.ts
 */
export interface EditorService {
	readonly GetActiveEditor: () => unknown | null;

	readonly GetVisibleEditors: () => readonly unknown[];

	readonly OpenEditor: (
		uri: string,

		options?: Record<string, unknown>,
	) => Promise<unknown>;

	readonly CloseEditor: (editor: unknown) => Promise<void>;

	readonly GetSelections: () => readonly unknown[];

	readonly SetSelections: (
		selections: readonly unknown[],
	) => Promise<void>;

	readonly RevealRange: (
		range: unknown,

		revealType?: number,
	) => Promise<void>;

	readonly ApplyDecorations: (
		editor: unknown,

		decorations: readonly unknown[],
	) => Promise<void>;
}
