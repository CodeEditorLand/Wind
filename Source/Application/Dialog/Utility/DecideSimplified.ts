// Application/Dialog/Utility/DecideSimplified.ts
import { VsCodeScheme } from "../../../Integration/Tauri.js";

export default function Decide(scheme: string): boolean {
	return ![
		VsCodeScheme.file,

		VsCodeScheme.vscodeUserData,

		VsCodeScheme.tmp,
	].includes(scheme);
}
