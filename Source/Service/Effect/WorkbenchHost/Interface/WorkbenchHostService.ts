export interface WorkbenchHostService {
	readonly Reload: () => Promise<void>;

	readonly Restart: () => Promise<void>;

	readonly Close: () => Promise<void>;

	readonly Focus: () => Promise<void>;

	readonly OpenWindow: (uris: ReadonlyArray<string>) => Promise<void>;

	readonly OnDidChangeFocus: (callback: (focused: boolean) => void) => {
		readonly dispose: () => void;
	};
}
