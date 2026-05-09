export interface UpstreamWorkbenchTheme {
	readonly id: string;

	readonly label: string;

	readonly type: "light" | "dark" | "hcLight" | "hcDark" | string;

	readonly settingsId?: string;
}

export interface UpstreamWorkbenchColorTheme extends UpstreamWorkbenchTheme {
	readonly tokenColors?: readonly { readonly settings?: unknown }[];

	getColor?: (id: string) => { toString: () => string } | undefined;
}

export interface WorkbenchThemeBridgeShape {
	readonly getColorTheme: () => UpstreamWorkbenchColorTheme;

	readonly getColorThemes: () => Promise<readonly UpstreamWorkbenchTheme[]>;

	readonly setColorTheme: (
		theme: UpstreamWorkbenchTheme | string,

		settingsTarget?: number | "auto",
	) => Promise<UpstreamWorkbenchColorTheme>;

	readonly onDidColorThemeChange: (
		listener: (next: UpstreamWorkbenchColorTheme) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchThemeGlobals {
	readonly __CEL_SERVICES__?: {
		readonly WorkbenchTheme?: WorkbenchThemeBridgeShape | null;

		readonly Theme?: WorkbenchThemeBridgeShape | null;
	};
}

export const WorkbenchThemeKindFromUpstream = (
	type: UpstreamWorkbenchTheme["type"],
): "vs" | "vs-dark" | "hc-black" | "hc-light" => {
	switch (type) {
		case "light":
			return "vs";

		case "dark":
			return "vs-dark";

		case "hcLight":
			return "hc-light";

		case "hcDark":
			return "hc-black";

		default:
			return "vs-dark";
	}
};
