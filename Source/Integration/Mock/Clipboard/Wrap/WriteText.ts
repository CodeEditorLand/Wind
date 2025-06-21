/**
 * @module MockWriteText (Clipboard Wrapper)
 * @description A mock Effect for writing text to the system clipboard.
 */

import { Effect } from "effect";

/**
 * A mock implementation of the `WriteText` integration effect.
 * It immediately returns a successful Effect and can optionally log the input
 * for test verification purposes.
 * @param Text - The text that would have been written to the clipboard.
 */
export const MockWriteText = (Text: string) =>
	Effect.logInfo(`MockWriteText received: "${Text}"`).pipe(Effect.asUnit);
