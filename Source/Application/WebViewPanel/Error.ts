/**
 * @module Error (Application/WebViewPanel)
 * @description Defines domain-specific, tagged errors for webview panel operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a webview panel operation, such as
 * failing to create a panel via the host or an error during its lifecycle.
 */
export class WebViewPanelProblem extends Data.TaggedError(
	"WebViewPanelProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
