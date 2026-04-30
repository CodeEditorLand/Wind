export interface WorkbenchProductBridgeShape {
	readonly nameLong: string;
	readonly nameShort: string;
	readonly version: string;
	readonly commit?: string;
	readonly date?: string;
	readonly quality?: string;
	readonly applicationName: string;
	readonly extensionsGallery?: { readonly serviceUrl: string };
	readonly [key: string]: unknown;
}

export interface WorkbenchProductGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Product?: WorkbenchProductBridgeShape | null;
	};
}
