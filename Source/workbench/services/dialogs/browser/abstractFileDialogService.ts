import { Scheme as VsCodeScheme } from "../../../Integration/Tauri.js";

const Decide = (Scheme: string, UseSimpleDialogSetting: boolean): boolean => {
	// Use the simplified (web) dialog if the user has explicitly enabled it in settings,
	// or if the URI scheme is not a native file or user-data scheme that Tauri can handle.
	return (
		UseSimpleDialogSetting ||
		![
			VsCodeScheme.file,
			VsCodeScheme.vscodeUserData,
			VsCodeScheme.tmp,
		].includes(Scheme)
	);
};

export default Decide;
