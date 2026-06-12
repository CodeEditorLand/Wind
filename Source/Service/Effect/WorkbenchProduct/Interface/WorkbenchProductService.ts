export interface WorkbenchProductSnapshot {
	readonly nameLong: string;

	readonly nameShort: string;

	readonly version: string;

	readonly commit: string | null;

	readonly date: string | null;

	readonly quality: string | null;

	readonly applicationName: string;

	readonly extensionsGallery: { readonly serviceUrl: string } | null;
}

export interface WorkbenchProductService {
	readonly Snapshot: () => WorkbenchProductSnapshot;

	readonly Get: <T = unknown>(key: string) => T | undefined;
}
