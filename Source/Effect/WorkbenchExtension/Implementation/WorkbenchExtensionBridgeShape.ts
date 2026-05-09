export interface UpstreamExtensionDescriptor {
	readonly identifier: { value: string };

	readonly version: string;

	readonly displayName?: string;

	readonly publisher?: string;

	readonly isBuiltin?: boolean;

	readonly extensionLocation: { toString: () => string };
}

export interface WorkbenchExtensionBridgeShape {
	readonly extensions: ReadonlyArray<UpstreamExtensionDescriptor>;

	readonly activateById: (
		identifier: { value: string },

		reason: { startup: boolean; extensionId: { value: string } },
	) => Promise<void>;

	readonly activateByEvent: (event: string) => Promise<void>;

	readonly onDidChangeExtensions: (
		listener: (event: {
			readonly added: ReadonlyArray<UpstreamExtensionDescriptor>;
			readonly removed: ReadonlyArray<UpstreamExtensionDescriptor>;
		}) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchExtensionGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Extension?: WorkbenchExtensionBridgeShape | null;
	};
}
