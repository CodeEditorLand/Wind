export interface WorkbenchClipboardService {
	readonly ReadText: () => Promise<string>;

	readonly WriteText: (value: string) => Promise<void>;

	readonly ReadResources: () => Promise<ReadonlyArray<string>>;

	readonly WriteResources: (uris: ReadonlyArray<string>) => Promise<void>;
}
