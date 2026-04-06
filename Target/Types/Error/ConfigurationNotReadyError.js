class o extends Error {
	_tag = "ConfigurationNotReadyError";
	constructor() {
		super("Configuration not yet resolved from preload");
	}
}
export { o as ConfigurationNotReadyError };
