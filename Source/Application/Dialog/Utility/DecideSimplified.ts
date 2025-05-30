// Application/Dialog/Utility/DecideSimplified.ts
// Purpose: Pure function to determine if a simplified dialog should be used based on URI scheme.

import { VsCodeScheme } from "../../../Integration/Tauri.js"; // Using VsCodeScheme from aggregator

/**
 * @module DecideSimplified
 * @description Determines if a simplified dialog flow should be used based on the URI scheme.
 * Returns true if the scheme is not 'file', 'vscode-userdata', or 'tmp'.
 */
export default function Decide(scheme: string): boolean {
	return ![
		VsCodeScheme.file,
		VsCodeScheme.vscodeUserData,
		VsCodeScheme.tmp,
	].includes(scheme);
}
