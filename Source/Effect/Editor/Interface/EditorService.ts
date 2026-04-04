import type { Effect } from "effect";
import type { EditorProblem } from "../Type/EditorProblem.js";

/**
 * Editor service interface
 * Microsoft VSCode Reference: ICodeEditorService from vs/editor/browser/services/codeEditorService.ts
 */
export interface EditorService {
	readonly GetActiveEditor: () => Effect.Effect<unknown | null, EditorProblem>;
	readonly GetVisibleEditors: () => Effect.Effect<readonly unknown[], EditorProblem>;
	readonly OpenEditor: (uri: string, options?: Record<string, unknown>) => Effect.Effect<unknown, EditorProblem>;
	readonly CloseEditor: (editor: unknown) => Effect.Effect<void, EditorProblem>;
	readonly GetSelections: () => Effect.Effect<readonly unknown[], EditorProblem>;
	readonly SetSelections: (selections: readonly unknown[]) => Effect.Effect<void, EditorProblem>;
	readonly RevealRange: (range: unknown, revealType?: number) => Effect.Effect<void, EditorProblem>;
	readonly ApplyDecorations: (editor: unknown, decorations: readonly unknown[]) => Effect.Effect<void, EditorProblem>;
}
