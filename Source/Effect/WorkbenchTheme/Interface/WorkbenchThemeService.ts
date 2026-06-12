export type WorkbenchThemeKind = "vs" | "vs-dark" | "hc-black" | "hc-light";

export interface WorkbenchThemeDescriptor {
	readonly id: string;

	readonly label: string;

	readonly kind: WorkbenchThemeKind;
}

export interface WorkbenchThemeChangeEvent {
	readonly previous: WorkbenchThemeDescriptor | undefined;

	readonly current: WorkbenchThemeDescriptor;
}

export interface WorkbenchThemeService {
	readonly Active: () => WorkbenchThemeDescriptor;

	readonly List: () => Promise<readonly WorkbenchThemeDescriptor[]>;

	readonly Apply: (themeId: string) => Promise<void>;

	readonly Token: (key: string) => string | undefined;

	readonly Changes: (
		callback: (event: WorkbenchThemeChangeEvent) => void,
	) => { readonly dispose: () => void };
}
