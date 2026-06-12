export interface WorkbenchExtensionDescriptor {
	readonly identifier: string;

	readonly version: string;

	readonly displayName: string | null;

	readonly publisher: string | null;

	readonly isBuiltin: boolean;

	readonly extensionLocation: string;
}

export interface WorkbenchExtensionService {
	readonly Snapshot: () => ReadonlyArray<WorkbenchExtensionDescriptor>;

	readonly Activate: (extensionId: string) => Promise<void>;

	readonly ActivateByEvent: (event: string) => Promise<void>;

	readonly OnExtensionsChange: (
		callback: (
			extensions: ReadonlyArray<WorkbenchExtensionDescriptor>,
		) => void,
	) => { readonly dispose: () => void };
}
