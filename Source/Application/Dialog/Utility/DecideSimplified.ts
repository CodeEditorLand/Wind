/*
 * File: Wind/Source/Application/Dialog/Utility/DecideSimplified.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:04 UTC
 * Dependency: ../../../Integration/Tauri.js
 * Export: Decide
 */

// Application/Dialog/Utility/DecideSimplified.ts
// Import Scheme and alias
import { Scheme as VsCodeScheme } from "../../../Integration/Tauri.js";

export default function Decide(scheme: string): boolean {
	return ![
		VsCodeScheme.file,

		VsCodeScheme.vscodeUserData,

		VsCodeScheme.tmp,
	].includes(scheme);
}
