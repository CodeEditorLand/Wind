/**
 * @module MockReadText (Clipboard Wrapper)
 * @description A mock Effect for reading text from the clipboard.
 */
import { Effect } from "effect";
/**
 * A mock implementation of the `ReadText` integration effect.
 * Instead of calling a Tauri API, it immediately returns a successful Effect
 * with a hardcoded string.
 */
export declare const MockReadText: () => Effect.Effect<string, never, never>;
//# sourceMappingURL=ReadText.d.ts.map