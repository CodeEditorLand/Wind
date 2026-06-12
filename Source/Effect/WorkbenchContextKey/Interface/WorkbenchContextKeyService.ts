export interface WorkbenchContextKeyChangeEvent {
	readonly affectedKeys: ReadonlySet<string>;
}

export interface WorkbenchContextKeyService {
	readonly Get: <T = unknown>(key: string) => T | undefined;

	readonly Set: <T>(key: string, value: T) => void;

	readonly Reset: (key: string) => void;

	readonly Match: (expression: string) => boolean;

	readonly Changes: (
		callback: (event: WorkbenchContextKeyChangeEvent) => void,
	) => { readonly dispose: () => void };
}
